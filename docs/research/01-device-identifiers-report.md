# Relatório: Identificadores de Dispositivo Persistentes para Autenticação Sem Login (React Native/Expo, iOS + Android)

> Contexto do pedido: app usa a identidade do dispositivo como única credencial (sem tela de login). Implementação atual: UUID aleatório (`expo-crypto`) persistido em MMKV — perdido no desinstalar. Backend expõe `POST /auth/device` que confia cegamente no `deviceId` enviado pelo cliente (zero verificação criptográfica).

---

## 1. iOS — identificadores e persistência real

### 1.1 `identifierForVendor` (IDFV)

- É um UUID por **vendor** (todos os apps do mesmo publisher, definido pelo prefixo do Bundle ID/Team) por **dispositivo**, exposto via `UIDevice.current.identifierForVendor` ([Apple Docs](https://developer.apple.com/documentation/uikit/uidevice/identifierforvendor)).
- **Permanece igual** enquanto pelo menos um app do mesmo vendor estiver instalado no aparelho — inclusive sobrevive a **atualizações do app** e **atualizações do iOS**.
- **Muda** quando o usuário desinstala **todos** os apps daquele vendor e reinstala depois — nesse momento a IDFV é regenerada ([gist explicativo](https://gist.github.com/hujunfeng/6265995), [Adjust glossary](https://www.adjust.com/glossary/idfv/)). Ou seja: reinstalar sozinho o app já quebra a persistência, a menos que outro app seu continue instalado.
- A própria Apple, via engenheiro de DTS, recomenda que apps sejam **resilientes a mudanças de IDFV** ([fórum Apple](https://developer.apple.com/forums/thread/781069)).
- **Não requer ATT** — IDFV não é considerado "tracking" por ser escopado ao vendor.
- Exposta no Expo via `expo-application`: `Application.getIosIdForVendorAsync()`, pode retornar `null` em certos cenários ([Expo Docs](https://docs.expo.dev/versions/latest/sdk/application/)).

**Conclusão:** estável entre sessões e updates, mas **não resolve reinstalação isolada** do seu app.

### 1.2 IDFA (Advertising Identifier)

Inadequado: exige **App Tracking Transparency (ATT)**; se recusado, vira `00000000-0000-0000-0000-000000000000`. Resetável pelo usuário a qualquer momento. Propósito declarado é atribuição de anúncios, não identidade de conta — usar para autenticação adiciona fricção de permissão que o requisito "zero login" quer evitar.

### 1.3 UUID persistido no Keychain (a técnica clássica)

**Por que sobrevive à desinstalação quando MMKV/UserDefaults não sobrevivem:** o sandbox de dados do app é apagado pelo iOS na desinstalação. O **Keychain** é um armazenamento do sistema **separado do sandbox** — historicamente, itens do Keychain não são removidos na desinstalação ([Medium](https://medium.com/@miguelcma/persistent-cross-install-device-identifier-on-ios-using-keychain-ac9e4f84870f), [fórum Apple](https://developer.apple.com/forums/thread/36442)).

Pontos verificados:
- Engenheiro de DTS da Apple confirmou: **"This was most definitely an implementation detail... Our keychain documentation has never specified what would happen in this case"** — ou seja, **nunca foi contratualmente garantido** ([fórum Apple](https://developer.apple.com/forums/thread/36442)).
- Susto histórico: no iOS 10.3 beta 2 o Keychain parecia ser apagado na desinstalação — revertido antes do lançamento final ([fórum Apple](https://developer.apple.com/forums/thread/72271)). A Apple **poderia mudar isso sem aviso**.
- Issue recente do Expo (#40662, out/2025) corrige a doc do `expo-secure-store`: no **Android** os dados NÃO sobrevivem à desinstalação, mas no **iOS** sobrevivem com o mesmo Bundle ID ([GitHub issue](https://github.com/expo/expo/issues/40662)). A doc atual é explícita: *"this is not guaranteed and you should never rely on this implementation detail."*
- O atributo `kSecAttrAccessibleAfterFirstUnlock`/`ThisDeviceOnly` controla **quando** o item pode ser lido (relativo ao lock state), **não** a sobrevivência à desinstalação — são ortogonais.
- **Sem** `ThisDeviceOnly`, o item sincroniza via iCloud Keychain para outros aparelhos do mesmo Apple ID — indesejável aqui (romperia 1 dispositivo = 1 identidade). **Com** `ThisDeviceOnly` é o comportamento correto.

**Caveats de sobrevivência:**
- ✅ Sobrevive: desinstalar/reinstalar mesmo app no mesmo aparelho, updates de app/iOS, reboot.
- ❌ Não sobrevive: "Apagar Conteúdo e Ajustes".
- ❌ Não sobrevive (com `ThisDeviceOnly`): restauração para aparelho novo via backup iCloud/iTunes — o que é desejável aqui.
- ⚠️ Simulador iOS tem comportamento de Keychain menos confiável entre resets — testar em dispositivo físico.

Libs: `expo-secure-store` (wrapper oficial) e `react-native-keychain`.

### 1.4 `react-native-device-info` — como resolve isso "por baixo dos panos" (iOS)

Código-fonte (`DeviceUID.m`): `getUniqueId()` implementa fallback **1) Keychain → 2) NSUserDefaults → 3) IDFV → 4) UUID aleatório → 5) persiste em Keychain + NSUserDefaults** ([GitHub](https://github.com/react-native-device-info/react-native-device-info/blob/master/ios/RNDeviceInfo/DeviceUID.m)). Doc: *"stored in iOS Keychain and NSUserDefaults. So it would stay the same even if you delete the app or reset IDFV."*

⚠️ Changelog recente da lib mudou a semântica de `getUniqueId()` no iOS — reforça que **implementar a técnica você mesmo** via `expo-secure-store` com `ThisDeviceOnly` é mais previsível que depender do comportamento implícito de uma lib de terceiros que já mudou de semântica.

**No Android**, `getUniqueId()` **não** gera UUID próprio — é idêntico a `getAndroidId()` (repassa `ANDROID_ID`), sem fallback persistente próprio ([npm](https://www.npmjs.com/package/react-native-device-info), [DeviceIdResolver.java](https://github.com/react-native-device-info/react-native-device-info/blob/master/android/src/main/java/com/learnium/RNDeviceInfo/resolver/DeviceIdResolver.java)). A lib tem um método separado, `getInstanceId()`, que cai para `UUID.randomUUID()` gravado em SharedPreferences comuns — funcionalmente equivalente ao que o app já faz manualmente hoje com MMKV.

### 1.5 Restrição das App Store Review Guidelines

A guideline **5.1.2(iii)** ("Data Use and Sharing") proíbe diretamente **fingerprinting de dispositivo**: *"Apps that fingerprint users or devices are not appropriate for the App Store"* — não sanável por consentimento ou disclosure. Qualquer identificador usado para unir dados com terceiros para ads/measurement exige `AppTrackingTransparency`. A **Seção 3.3.9 do Apple Developer Program License Agreement** vai além: *"neither you nor the app may derive data from a device in order to uniquely identify it"* — cláusula contratual, não só de review.

Um caso relatado no fórum da Apple (2026) mostra rejeição citando 5.1.2(iii) + ADPLA 3.3.9, com instrução para remover "algorithmically converted device and usage data" usado para identificar usuário/dispositivo.

**Isso se aplica a um UUID auto-gerado persistido no Keychain?**
- Um UUID `crypto.randomUUID()` salvo no Keychain, nunca compartilhado com terceiros para ads, **não é fingerprinting** no sentido da guideline — fingerprinting é derivar um identificador probabilisticamente de sinais de hardware/SO, não um valor auto-atribuído e controlado pelo próprio app (análogo à IDFV, que a própria Apple expõe publicamente). Não há relatos de rejeição documentados especificamente contra esse padrão.
- Onde a Review pode legitimamente questionar não é o mecanismo de persistência, é a **ausência de conta/login** — mas a guideline 5.1.1(ix) (Account Sign-In) trata de apps que exigem login sem oferecer certas opções de SSO; como este produto não tem login algum, essa guideline simplesmente não se aplica.

**Conclusão:** não há, nas guidelines atuais nem em precedentes encontrados, restrição direta contra persistir um UUID auto-gerado no Keychain como identidade de sessão. O risco real de compliance está em (a) usar esse identificador para join com dados de terceiros/ads sem ATT, e (b) o fingerprinting genérico se o identificador fosse *inferido* de sinais de hardware — nenhuma das duas descreve o desenho atual.

---

## 2. Identificadores Android e sua persistência real

### 2.1 `ANDROID_ID`

Desde Android 8 (API 26), é **escopado por app-signing-key + usuário + dispositivo** — dois apps diferentes no mesmo aparelho recebem valores distintos.

- **Sobrevive** update de app/SO (mesmo pacote + mesma signing key) e **sobrevive desinstalar/reinstalar** do mesmo app.
- **Muda** em factory reset, e pode mudar se a signing key trocar entre desinstalação e reinstalação (comum em pipelines CI/CD com Play App Signing usando upload key separada).
- Não requer permissão especial.

**Conclusão:** é hoje o mais próximo de um "IDFV do Android" — mas com a ressalva real de rotação de signing key invalidá-lo silenciosamente.

### 2.2 GAID / Advertising ID

Ao contrário do esperado, **não foi descontinuado** — o Google encerrou em 2025 as APIs do Privacy Sandbox que o substituiriam, mantendo-o ativo. Ainda assim, inadequado aqui:
1. Resetável pelo usuário a qualquer momento.
2. Desde fim de 2021, se o usuário desativa anúncios personalizados, o GAID retornado é uma string de zeros — o app perde acesso ao valor real mesmo para uso não-publicitário.
Usar para autenticação também provavelmente viola a política do Play sobre uso do Advertising ID.

### 2.3 Android Keystore + SharedPreferences: o "mito" da persistência via backup

**Base:** tanto Keystore quanto SharedPreferences comuns são apagados na desinstalação — o sistema remove o diretório de dados do app e as entradas de Keystore associadas. Vale para `expo-secure-store` no Android também; a própria lib configura Auto Backup para **excluir** seus dados (reconhecendo que restaurar sem a chave original geraria dado corrompido).

**Auto Backup for Apps** — a peça que mais se aproxima (mas não iguala) o Keychain:
- Apps visando Android 6+ participam automaticamente; inclui SharedPreferences, armazenamento interno, SQLite.
- Backup salvo em pasta privada do Google Drive do usuário, 25MB por app, só o mais recente retido.
- Restauração automática ocorre **antes** do app ficar disponível ao usuário — teoricamente um UUID em SharedPreferences não-criptografadas *poderia* sobreviver a desinstalar/reinstalar.
- **Mas é frágil**: backup assíncrono, ~24h, exige Wi-Fi e (em várias versões) carregando/ocioso; inconsistente entre OEMs, alguns desativam/alteram o comportamento; sem garantia de que exista um backup recente no momento da desinstalação.
- **Restaura também em aparelho novo** logado na mesma conta Google — Auto Backup não distingue "mesmo aparelho reinstalado" de "aparelho novo restaurado", diferente do Keychain iOS (que por padrão só persiste no mesmo device físico).
- Controle do dev: `android:allowBackup` (default `true`), `android:fullBackupContent`/`dataExtractionRules` para incluir/excluir arquivos específicos.

**Conclusão:** um UUID em SharedPreferences pode sobreviver desinstalar/reinstalar em condições favoráveis, mas é **best-effort, não determinístico** — não equivalente à confiabilidade do Keychain.

### 2.4 Firebase Installation ID (FID)

Escopado **à instalação do app**, por design: a doc oficial lista desinstalação/reinstalação (mesmo em aparelho novo), limpeza de cache, e inatividade prolongada (270 dias) como gatilhos de rotação. Texto oficial: *"its scope is limited to the app... it's reset upon app reinstall."* **Não resolve** persistência entre reinstalações — é o oposto por especificação.

### 2.5 Play Integrity API (ex-SafetyNet)

Propósito de **atestação**, não identificação: responde "este app é genuíno, não adulterado, rodando em Android certificado?" via veredictos verificados no servidor. Não expõe identificador estável reutilizável. O guia oficial insiste: verificação deve acontecer no servidor, nunca confiar no cliente. Seria a ferramenta certa para um problema *adjacente* ("provar que quem chama `/auth/device` é um app genuíno") — ortogonal a "qual UUID esse dispositivo tem".

---

## 3. Panorama de bibliotecas React Native/Expo

- **`expo-application`** (`~57.0.2` para SDK 57): `getIosIdForVendorAsync()` (async, pode retornar `null`) e `getAndroidId()` (síncrono). Casca fina sobre os identificadores nativos — não implementa persistência própria.
- **`expo-secure-store`**: Keychain no iOS, `EncryptedSharedPreferences` (AES-256, chave no Android Keystore) no Android. No Android, desinstalar remove tanto o arquivo quanto a chave no Keystore — **não há truque análogo ao Keychain**; a lib já exclui seus dados do Auto Backup por padrão.
- **`react-native-device-info`**: ver seção 1.4 (iOS via Keychain fallback) e a nota Android acima (`getUniqueId()` = `ANDROID_ID`; `getInstanceId()` = UUID em SharedPreferences comuns).

---

## 4. Bottom line

### 4.1 Não existe identificador único de hardware acessível a apps de terceiros

Apple e Google removeram deliberadamente, por privacidade, o acesso de apps a qualquer identificador ligado ao hardware físico. No iOS isso começou com a depreciação do UDID (iOS 5) e se consolidou na iOS 7 (IDFV/IDFA). No Android, o movimento foi mais gradual entre as versões 8–10 (ANDROID_ID escopado por app+assinatura, IMEI/Serial exigindo permissões de sistema). **Todo identificador hoje disponível é uma de quatro coisas**: escopado por app (IDFV, ANDROID_ID pós-Oreo), escopado por publicidade e resetável (IDFA, GAID), autogerado com persistência de melhor esforço (UUID em Keychain/SharedPreferences/MMKV), ou identificador de instalação de SDK terceiro (Firebase FID). Nenhum é um "hardware ID" no sentido histórico.

### 4.2 Tabela comparativa

| Identificador | Sobrevive restart do app | Sobrevive update do app | Sobrevive desinstalar/reinstalar (mesmo aparelho) | Sobrevive factory reset | Sobrevive troca de aparelho | Exige permissão especial | Risco de política de loja | Complexidade de implementação |
|---|---|---|---|---|---|---|---|---|
| IDFV (iOS) | Sim | Sim | Não (reseta se for o último app do vendor desinstalado) | Não | Não | Não | Baixo | Baixa |
| IDFA (iOS) | Sim | Sim | Parcial (reseta se o usuário resetar via Configurações) | Não | Não | Sim (ATT) | Alto (uso fora de ads é rejeitado) | Média |
| UUID persistido no Keychain (iOS) | Sim | Sim | Sim | Não | Não (a menos que restaurado do mesmo Apple ID) | Não | Baixo | Média |
| ANDROID_ID | Sim | Sim | Sim (mas pode variar por app+assinatura desde Android 8) | Não | Não | Não | Baixo | Baixa |
| GAID / Advertising ID | Sim | Sim | Parcial (usuário pode resetar/apagar) | Não | Não | Não (mas requer respeitar opt-out) | Alto (uso fora de ads viola política) | Média |
| UUID em SharedPreferences via Auto Backup (Android, best-effort) | Sim | Sim | Parcial/best-effort (exige backup ativo, conta Google, Wi-Fi, ociosidade, <25MB) | Não | Parcial/best-effort | Não | Baixo | Média |
| Firebase Installation ID | Sim | Sim | Não (novo ID a cada instalação, por design) | Não | Não | Não | Baixo | Baixa (exige Firebase) |
| UUID em MMKV/AsyncStorage (linha de base atual) | Sim | Sim | Não | Não | Não | Não | Baixo | Baixa |
| Play Integrity API | N/A (atestação por-requisição, não identificador) | N/A | N/A | N/A | N/A | Não (exige Play Services + backend integrado) | Baixo | Alta |

### 4.3 Recomendação final

**Não** — trocar MMKV por Keychain (iOS) + ANDROID_ID/SharedPreferences (Android) **não muda nenhuma propriedade de segurança relevante**. Melhora só a UX de um cenário acidental (usuário desinstala/reinstala e "recupera" a identidade sem perceber). O modelo de confiança do backend permanece idêntico, porque `POST /auth/device` aceita **qualquer string enviada pelo cliente, sem prova de posse nenhuma** — nunca verificou que o `deviceId` corresponde a um Keychain real, a um ANDROID_ID real, ou a coisa nenhuma. Um atacante não precisa "quebrar" a persistência: basta interceptar o tráfego de rede, ler o `deviceId`, e reenviá-lo em qualquer outro cliente HTTP para se tornar aquela conta — nem precisa possuir um dispositivo iOS/Android. **Persistência mais robusta resolve "o app esqueceu quem eu era depois que reinstalei"; não resolve "qualquer um pode alegar ser qualquer device".** São problemas ortogonais — não vender a troca de storage como hardening de segurança.

**Recomendação concreta, em duas frentes independentes:**

1. **UX/persistência (fazer — é barato, sem trade-off real):** migrar para `expo-secure-store` no iOS (Keychain, `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` ou equivalente) e manter MMKV no Android, opcionalmente aceitando a cobertura best-effort do Auto Backup. Rotular internamente como melhoria de **continuidade de sessão**, não como hardening.

2. **Segurança real (a parte que efetivamente importa — nenhuma troca de storage resolve isso):** o backend precisa parar de confiar numa string opaca. Caminho proporcional: gerar, na primeira execução, um par de chaves assimétrico local (Keychain/`SecKey` no iOS, Android Keystore/`KeyPairGenerator` no Android), registrar a chave pública junto do `deviceId` em `/auth/device`, e exigir que as requisições de login venham **assinadas** com a chave privada não-exportável — o servidor verifica a assinatura contra a chave pública registrada. Isso transforma "device identity" de uma alegação (string) em prova de posse de chave (o atacante pode copiar o `deviceId`, não a chave privada do Secure Enclave/Keystore). Para reforço extra contra emuladores/apps adulterados: App Attest (iOS) + Play Integrity (Android) no registro do device. Trade-off aceito: mais complexidade (gestão de chaves, endpoint de assinatura, verificação no backend, fluxo de "vincular a novo aparelho" — já que, por design, nada disso sobrevive troca de hardware; qualquer coisa que sobrevivesse estaria reintroduzindo um identificador cross-device, contradizendo a premissa "1 dispositivo = 1 identidade").
