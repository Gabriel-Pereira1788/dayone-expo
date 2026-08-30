# Autenticação Deviceless Anônima: Persistência vs. Tamper-Resistance no Android

## Resumo executivo (TL;DR)

A tensão entre "identificador sobrevive reinstall" e "credencial não é forjável" é **real, documentada e parcialmente solucionável no Android** — mas não pela via que se pensaria primeiro (Keystore). A solução correta e oficialmente suportada pelo Google é a API **Restore Credentials** (sucessora do antigo Block Store), condicionada a pré-requisitos que cobrem a grande maioria — mas não 100% — dos dispositivos Android reais. No iOS, o **App Attest é explicitamente desenhado para NÃO sobreviver a reinstalação** — resolve um problema diferente (attestation de integridade por sessão de instalação), não persistência de identidade.

---

## 1. Google Play Services Block Store / `androidx.credentials` Restore Credentials

### 1.a. Block Store está sendo substituído — use Restore Credentials

O **Block Store API** (`com.google.android.gms.auth.blockstore`) ainda funciona (apps existentes não são obrigados a migrar até 30/09/2026), mas a via oficial para adoção nova é a **Restore Credentials**, feature do Credential Manager Jetpack (`androidx.credentials:credentials:1.5.0+`), anunciada em novembro de 2024.

Fontes: [Android Developers Blog — Introducing Restore Credentials](https://android-developers.googleblog.com/2024/11/maintain-strong-user-relationships-with-restore-credentials.html) · [AEP guideline](https://developer.android.com/distribute/aep/aep-req-restore-credentials) · [Block Store | Android Developers](https://developer.android.com/identity/block-store)

### 1.b. Sobrevive a uninstall+reinstall no MESMO dispositivo?

**Sim, comprovadamente** — o Google fornece um procedimento de teste específico para esse cenário exato:

> "To test with the same device, uninstall and reinstall your app... verify that the bytes retrieved are the same as what were stored before uninstallation."
> Fonte: [Block Store | Identity | Android Developers](https://developer.android.com/identity/block-store) · [Test Restore Credentials](https://developer.android.com/identity/sign-in/test-restore-credentials)

A persistência está atrelada ao **backup do próprio Android** (`Settings > Google > Backup`), não a um transfer manual app-to-app — funciona tanto no reinstall no mesmo aparelho quanto na migração para um aparelho novo.

### 1.c. Requer conta Google?

**Requer Backup do Google ativado** — ligado por padrão na maioria absoluta dos aparelhos com Play Services, mas **não é garantia universal** (sem conta Google, backup desativado manualmente, ou sem tela de bloqueio configurada — necessária pra E2E encryption — não terão a persistência). O Google recomenda tratar `isCloudBackupEnabled` como opcional, com fallback.

Requisitos formais: **Android 9+**, **GMS core ≥ 24220000**, **`androidx.credentials` ≥ 1.5.0**.

### 1.d. Setup em React Native/Expo

**Não existe wrapper maduro específico para Restore Credentials em RN/Expo.** `android-credential-manager` (Expo module) cobre passkeys/senha/Google Sign-In, mas não expõe o fluxo `CreatePasswordRequest`/`RestoreCredential` de blob arbitrário. **Conclusão prática:** necessário um **Expo Module nativo Kotlin custom**, chamando `androidx.credentials.CredentialManager` com `CreateRestoreCredentialRequest`/`GetRestoreCredentialOption` — módulo pequeno e bem definido, compatível com New Architecture.

### 1.e. Quebra a não-exportabilidade do Keystore?

**Sim, estruturalmente.** Block Store/Restore Credentials armazena bytes brutos fornecidos (até 4KB); não tem noção de "chave de hardware não exportável". Colocar a chave privada EC ali faz ela **deixar de ser hardware-backed**. **Não há padrão documentado pelo Google** para "guardar só um seed pequeno e manter a chave real na Keystore" — é uma composição de design própria (ver Seção 6), não uma receita oficial.

---

## 2. Apple App Attest (`DCAppAttestService`)

### 2.a. Sobrevive a uninstall+reinstall?

**Não. Explicitamente não.** Declaração direta da Apple, repetida em duas sessões WWDC:

> "An App Attest key will not survive app reinstallation, is not backed up, and is not synced across devices."
> — [WWDC21 Session 10244](https://developer.apple.com/videos/play/wwdc2021/10244/)

> "Keys survive app updates but are invalidated by app reinstall or device restore, including iCloud restore."
> — [WWDC26 Session 201](https://developer.apple.com/videos/play/wwdc2026/201/)

Por design — a chave na Secure Enclave desaparece; usar o key ID antigo produz `invalidKey`. A recomendação da Apple ao backend: tratar reinstall como evento legítimo, não sinal de ataque.

### 2.b. É recomendação oficial? Serve para autenticação?

Sim, é a alternativa oficial da Apple a fingerprinting ad-hoc — mas seu propósito é **fraude/anti-abuso e integridade do app**, não autenticação persistente de identidade. A invalidação em reinstall confirma isso: atesta "esta instalação, neste device, agora", não "este usuário ao longo do tempo".

### 2.c. Implementação em RN/Expo

Sem módulo oficial. Comunidade: `react-native-app-attest` (Beta), `expo-app-integrity` (requer bare workflow), `appattest-checker-node` (verificação server-side).

**Conclusão da via 2:** App Attest não resolve persistência através de reinstall — é uma camada *adicional* de anti-fraude, não substituto da arquitetura Keychain UUID + par ECDSA já definida para o iOS.

---

## 3. Padrões de produção em apps reais

Não foi encontrado post de engenharia público de Snapchat/Discord descrevendo exatamente esse trade-off. O que é relevante e tem fonte:

- **Signal**: registro por telefone (não é "deviceless"), mas o padrão de recuperação pós-reinstall é instrutivo — só recupera estado se o usuário **ativou explicitamente** "Secure Backups", protegido por uma recovery key de 64 caracteres mantida no dispositivo (zero-knowledge). Sem opt-in, o histórico é irrecuperável.
  Fontes: [Signal Support — Backups and Device Transfers](https://support.signal.org/hc/en-us/articles/10074659364122-Backups-and-Device-Transfers-on-Signal) · [Troubleshooting Secure Backups](https://support.signal.org/hc/en-us/articles/10075139325850-Troubleshooting-Signal-Secure-Backups)
  **Padrão relevante:** Signal aceita explicitamente que, sem opt-in de backup, a persistência simplesmente não existe — evidência forte de que a indústria trata esse trade-off como genuíno.

---

## 4. Firebase Anonymous Authentication

**Confirmado: não sobrevive a reinstall no Android por padrão**, com inconsistência documentada entre plataformas:

- **Android/Web**: reinstall gera **novo UID** (esperado/documentado).
  Fonte: [firebase/firebase-ios-sdk#13885](https://github.com/firebase/firebase-ios-sdk/issues/13885)
- **iOS**: reinstall retorna o **mesmo UID** — classificado pelo próprio time do Firebase como **não esperado** (efeito colateral do Keychain, não design intencional).
  Fonte: [firebase/firebase-ios-sdk#13885](https://github.com/firebase/firebase-ios-sdk/issues/13885)
- Confirmação institucional: **"Anonymous auth is not designed to survive across multiple sessions [reinstalls]."**
  Fonte: [Firebase Google Groups](https://groups.google.com/g/firebase-talk/c/SdsyU2CwBHk)
- Técnica recomendada: linkar a conta anônima a uma credencial persistente antes do risco de perda — Firebase não oferece técnica nativa combinando com Block Store/Keychain.

**Conclusão:** Firebase Anonymous Auth tem exatamente a mesma limitação estrutural que este app já enfrenta, sem nem o benefício do ANDROID_ID.

---

## 5. Play Integrity API — nota complementar

Análogo Android ao App Attest — atesta integridade por request, não fornece persistência de identidade, serve como sinal anti-abuso complementar. [Fonte](https://developer.android.com/google/play/integrity/overview)

---

## 6. Veredito final e recomendação concreta

### A tensão é real, mas parcialmente solucionável, não totalmente irredutível

- App Attest, Play Integrity, Firebase Anonymous Auth: nenhum resolve — todos confirmam a mesma limitação (chave hardware não sobrevive a reinstall) ou têm o problema oposto (Firebase no Android também perde tudo).
- **Restore Credentials** é o único mecanismo que de fato persiste um segredo através de uninstall+reinstall no mesmo device Android, com teste oficial documentado. Não é universal (depende de Google Backup) e não preserva "chave nunca sai do hardware" se a chave privada crua for colocada lá dentro.

### Recomendação concreta

**Não** coloque a chave privada ECDSA (nem seed determinístico dela) no Restore Credentials/Keystore-bypass. Use uma arquitetura de **dois segredos com propósitos diferentes**:

1. **Chave de assinatura (curto prazo, por instalação)**: par ECDSA em Android Keystore, gerado por instalação, nunca exportável. Assina requests normais.

2. **Segredo de recuperação de reinstall (opaco, uso único)**: segredo aleatório de 32 bytes, **separado**, sem relação criptográfica com a chave Keystore. Registrado no backend como `{ deviceId: ANDROID_ID, recoverySecretHash, currentPublicKey }`. Gravado via `Restore Credentials` (`androidx.credentials`, `isCloudBackupEnabled = true`).
   - No primeiro registro pós-reinstall com `ANDROID_ID` já conhecido, o cliente tenta ler o Restore Credential. Se recuperar o segredo e o hash bater no backend, o servidor autoriza a **rotação/registro de nova chave pública Keystore** — fecha o gap de account-takeover, porque um atacante que só sniffou o `deviceId`/chave pública antiga não tem o segredo de recuperação (nunca trafega em texto puro, E2E-encrypted no backup do Google).
   - Se o Restore Credential não existir/falhar: **fail closed** — trata como dispositivo novo, sem re-registrar a chave antiga automaticamente. Preserva a garantia de segurança à custa de, para essa fração minoritária de aparelhos, perder o "reinstall recovery" — trade-off já aceito, agora restrito só ao subconjunto sem Google Backup.

3. **iOS**: mantém a abordagem já definida (Keychain UUID + chave ECDSA persistida no Keychain) — resolve nativamente, sem necessidade de App Attest para persistência (pode ser adicionado depois como sinal *extra* anti-fraude por sessão).

### Custo de implementação

- **Expo Module nativo Kotlin** novo (sem wrapper RN/Expo maduro para Restore Credentials) — escopo pequeno.
- Endpoint de backend adicional para o fluxo "prova de recuperação → rotação de chave pública".
- Sem dependência de terceiros instável — construir sobre `androidx.credentials` diretamente (Block Store está sendo descontinuado para adoção nova).

### Honestidade sobre os limites

Não é 100%: para o subconjunto de usuários Android sem conta Google logada ou com Google Backup desativado manualmente, a tensão original permanece sem solução (mesmo limite que Signal aceita). Mas para a imensa maioria dos dispositivos Android reais com Play Services, Restore Credentials fecha essa lacuna de forma oficialmente suportada e testável, sem exigir Google Sign-In explícito no app.
