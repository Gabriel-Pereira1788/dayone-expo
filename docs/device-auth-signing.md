# Device-Id Auth: fechando a lacuna de posse (assinatura por chave)

> Status: **não implementado**. Este documento descreve o problema, a pesquisa feita, e a arquitetura recomendada para uma implementação futura — quando houver tempo para fazer com calma, incluindo o módulo nativo Kotlin (Android) que essa solução completa exige.

## O que existe hoje

O app usa **device-id-only auth**: no boot, o cliente lê/gera um identificador de dispositivo e chama `POST /auth/device {deviceId}`. O backend (`FindOrCreateByDevice`) cria ou recupera uma conta associada a esse `deviceId`, sem tela de login, sem senha, sem verificação nenhuma além de "essa string existe ou não no banco".

**Identificador usado (implementado em `src/infra/device-identity/`):**
- **iOS**: UUID gerado uma vez com `expo-crypto` e persistido no **Keychain** via `expo-secure-store` (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`). Sobrevive a desinstalar/reinstalar o app no mesmo iPhone (o Keychain é armazenamento do sistema, fora da sandbox do app — não documentado como garantia contratual pela Apple, mas comportamento estável e amplamente usado na indústria).
- **Android**: `Settings.Secure.ANDROID_ID` (via `expo-application`), lido diretamente, sem storage próprio. Confirmado pelo blog oficial do Android Developers: sobrevive a desinstalar/reinstalar contanto que o pacote e a chave de assinatura do app não mudem — só reseta em factory reset ou rotação de chave de assinatura.

Isso resolve **persistência** (o app "lembra" quem você é depois de reinstalar sem querer) nas duas plataformas.

## O problema que persistência NÃO resolve

`POST /auth/device` aceita **qualquer string** que o cliente mandar, sem prova de posse nenhuma. O backend nunca verificou que o `deviceId` recebido corresponde a um Keychain real, a um `ANDROID_ID` real, ou a coisa nenhuma.

Um atacante não precisa "quebrar" a persistência do identificador — só precisa **ler o valor de `deviceId` uma vez** (interceptando tráfego de rede, um log vazado, um proxy MITM, etc.) e reenviá-lo em qualquer outro cliente HTTP para se tornar aquela conta. Não precisa possuir um iPhone/Android físico, não precisa saber nada sobre a implementação — é só uma string num JSON.

**Persistência mais robusta (Keychain, ANDROID_ID) não muda isso em nada.** São dois problemas ortogonais: "o app esqueceu quem eu era depois que reinstalei" vs. "qualquer um pode alegar ser qualquer device". A troca de storage resolve o primeiro; não toca no segundo.

## A solução: prova de posse via chave assimétrica

Ideia central: em vez de mandar uma string opaca, o dispositivo gera um **par de chaves ECDSA (P-256)** na primeira execução, manda a **chave pública** pro backend junto do `deviceId`, e **assina** toda requisição de login com a chave privada. O backend verifica a assinatura contra a chave pública que já tem registrada para aquele `deviceId`.

Isso transforma "device identity" de uma **alegação** (uma string qualquer) em uma **prova de posse de chave**: o atacante pode copiar o `deviceId` e a chave pública (ambos não são segredo), mas não a chave privada.

### Biblioteca escolhida: `react-native-quick-crypto`

Da Margelo (mesma família de libs Nitro que já usamos: `react-native-mmkv`, `salvetron`), implementa API compatível com o `crypto` do Node — `generateKeyPairSync('ec', { namedCurve: 'prime256v1' })`, `createSign`/`createVerify`. Não exige eject, funciona com `expo prebuild` normal.

**Importante ser honesto sobre o que isso É e NÃO é:** essa é uma chave gerada **em software** (OpenSSL/BoringSSL via JSI), guardada depois dentro do `expo-secure-store` (Keychain/Keystore-*criptografado*). **Não é** uma chave dentro do Secure Enclave (iOS) ou StrongBox (Android) de verdade — isso exigiria escrever um módulo nativo Swift/Kotlin customizado chamando as APIs de baixo nível (`SecKeyCreateRandomKey` com `kSecAttrTokenIDSecureEnclave` no iOS; `KeyGenParameterSpec` com `setIsStrongBoxBacked(true)` no Android), fora do escopo avaliado aqui. A chave fica protegida pela criptografia do Keychain/Keystore (bem melhor que uma string em MMKV em texto claro), mas não tem a garantia "nem o kernel comprometido consegue extrair" que hardware dedicado dá.

### Fluxo proposto

**Payload assinado:** `deviceId:timestamp` (string simples, hash SHA-256 implícito no `createSign`). O backend rejeita timestamps com mais de ~5 minutos de diferença — limita a janela de replay de uma requisição capturada sem precisar de infraestrutura de nonce.

**`POST /auth/device` body:** `{ deviceId, publicKey, timestamp, signature }`

**Lógica do backend (`LoginWithDevice`):**
1. Checar skew do timestamp (rejeitar se > 5min de diferença do relógio do servidor).
2. Buscar chave pública já registrada para esse `deviceId`:
   - **Se existe**: verificar a assinatura contra a chave **armazenada** (não a que veio na requisição). Falhou → `401`.
   - **Se não existe** (primeiro registro): verificar a assinatura contra a chave **enviada** na própria requisição (prova que quem está registrando essa chave realmente tem a privada correspondente) → criar conta, persistir a chave pública.
3. Emitir `Payload` normalmente.

**Migration necessária:** `users.public_key TEXT` (nullable, só usado no fluxo de device).

## A tensão real: Android quebra a composição ingênua

No iOS, isso funciona sem ressalvas: o Keychain guarda a chave privada e sobrevive a reinstall, então a mesma chave sempre está lá.

**No Android, não.** `ANDROID_ID` sobrevive a desinstalar/reinstalar (é do sistema), mas a chave privada guardada via Keystore (por baixo do `expo-secure-store`) **é sempre apagada na desinstalação** — sem exceção, é assim que o Android Keystore funciona por design.

Resultado: reinstalar no Android → `ANDROID_ID` continua igual (o backend "reconhece" o device) → mas a chave é nova → a assinatura não bate com a chave já registrada → `401`.

Duas saídas ingênuas, ambas erradas:
- **Falhar fechado sempre**: seguro, mas Android perde 100% do benefício de "recupera a conta ao reinstalar" que a persistência deveria trazer — regressão real de UX.
- **Permitir re-registrar a chave quando o `deviceId` já é conhecido**: recupera a UX, mas reabre exatamente a vulnerabilidade que a assinatura deveria fechar — quem descobrir o `deviceId` sniffando tráfego consegue registrar a própria chave e assumir a conta.

## A solução correta pesquisada: Android `Restore Credentials`

Existe um mecanismo do Google, oficialmente documentado e testado, que resolve isso: **Restore Credentials** (`androidx.credentials`, GA nov/2024, sucessora do antigo Block Store API).

- **Sobrevive a desinstalar/reinstalar no mesmo aparelho, comprovadamente** — o próprio Google documenta um procedimento de teste oficial pra esse cenário exato ([Test Restore Credentials](https://developer.android.com/identity/sign-in/test-restore-credentials)).
- Funciona através do backup do Google (`Settings > Google > Backup`), ligado por padrão na maioria dos aparelhos — mas não é garantia universal (sem conta Google, ou backup desligado manualmente, não tem essa persistência).
- Requisitos: Android 9+, Google Play services ≥ 24220000, `androidx.credentials` ≥ 1.5.0.

**Não dá pra simplesmente guardar a chave privada lá** — Restore Credentials guarda bytes brutos que você fornece (até 4KB), sem noção de "chave de hardware não-exportável". Colocar a chave EC ali faria ela deixar de ser protegida pelo Keystore.

### Arquitetura de dois segredos (a forma correta de combinar as duas coisas)

1. **Chave de assinatura (curto prazo, por instalação)**: exatamente como já descrito acima — par ECDSA via Keystore, gerado a cada instalação, nunca exportado. Assina os requests normais.
2. **Segredo de recuperação (separado, opaco, 32 bytes aleatórios, sem relação criptográfica com a chave de assinatura)**: gerado uma vez, registrado no backend como hash (`{ deviceId, recoverySecretHash, currentPublicKey }`), e o valor bruto gravado via Restore Credentials.
   - **Pós-reinstall**, se o cliente detectar que o `deviceId` (ANDROID_ID) já é conhecido, ele tenta ler o Restore Credential. Se recuperar o segredo e o hash bater no backend → o servidor autoriza uma **rotação de chave pública** pra aquele `deviceId` (fecha o gap: quem só tem o `deviceId`/chave pública antiga sniffados não tem o segredo de recuperação, que nunca trafega fora do backup E2E-encriptado do Google).
   - Se o Restore Credential não existir ou falhar (sem conta Google, backup desligado) → **fail closed**, trata como device novo. Mesmo trade-off que Signal aceita explicitamente pra usuários sem "Secure Backups" ativado — não é regressão, é o mesmo limite que a indústria já aceita como genuíno.

### Custo de implementação

- **Módulo nativo Kotlin customizado** (Expo Module) — não existe wrapper RN/Expo maduro pra Restore Credentials hoje. Escopo pequeno (chamadas diretas a `androidx.credentials.CredentialManager` com `CreatePasswordRequest`/`GetCredentialRequest` do tipo restore-credential), mas é código nativo Android do zero.
- **Endpoint novo no backend** pro fluxo "prova o segredo de recuperação → autoriza rotação de chave pública".
- iOS não precisa de nada equivalente — Keychain já resolve nativamente.

### O que NÃO resolve isso (pesquisado e descartado)

- **Apple App Attest**: desenhado explicitamente para **não sobreviver a reinstall** (confirmado em WWDC21 e WWDC26 pela própria Apple) — resolve integridade por sessão de instalação, não persistência de identidade.
- **Firebase Anonymous Auth**: não sobrevive a reinstall no Android por padrão (gera UID novo); no iOS "sobrevive" só como efeito colateral acidental do Keychain, que o próprio time do Firebase trata como comportamento não-intencional, não como feature.
- **Play Integrity API**: por design é um veredito de integridade por requisição, não um identificador persistente reutilizável.
- **OAID, Widevine device ID, key attestation, IMEI/MAC**: cobertos em detalhe no relatório de pesquisa (seção seguinte) — nenhum serve, por razões de escopo geográfico (OAID é só China), risco de política de loja (Widevine), ou bloqueio de permissão desde o Android 10 (IMEI/MAC).

## Fontes / relatórios de pesquisa completos

- `docs/research/01-device-identifiers-report.md` — levantamento geral iOS+Android, tabela comparativa.
- `docs/research/02-android-android-id-deep-dive.md` — confirmação aprofundada de que o `ANDROID_ID` sobrevive uninstall/reinstall (fonte primária AOSP + blog oficial).
- `docs/research/03-signing-architecture-deep-dive.md` — Restore Credentials, App Attest, Firebase Anonymous Auth, e a arquitetura de dois segredos recomendada.
