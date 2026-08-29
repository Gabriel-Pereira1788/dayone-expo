# ANDROID_ID e identificadores de dispositivo no Android moderno (10–15): investigação aprofundada

## 1. A pergunta central: ANDROID_ID sobrevive a desinstalação + reinstalação?

**Resposta curta: SIM, de forma confirmada e documentada oficialmente — mas com uma condição importante e uma exceção histórica que já não se aplica a devices "modernos".**

### 1.1 Onde o ANDROID_ID (SSAID) é armazenado — a distinção crucial

O SSAID **não** vive no sandbox de dados do app (`/data/data/<package>/`), que é apagado na desinstalação. Ele vive no `SettingsProvider`, um componente de sistema, no arquivo:

```
/data/system/users/<userId>/settings_ssaid.xml
```

Isso é confirmado diretamente no código-fonte do AOSP (`SettingsProvider.java` / `SettingsState.java`, `packages/SettingsProvider/`) — cs.android.com [1] e android.googlesource.com [2]. O SSAID é mantido numa tabela própria (`SSAID table`), separada das configurações `secure`, chaveada por **UID + nome de pacote**, e é o próprio `SettingsProvider` (processo `system_server`, roda como usuário `system`, não como o app) quem lê/escreve esse arquivo. Como é um arquivo pertencente ao sistema (dono `system`, fora do diretório do app), ele **sobrevive fisicamente** à desinstalação de um app de terceiros.

### 1.2 Confirmação oficial

O post oficial do blog Android Developers sobre as mudanças do Android O (8.0) confirma isso em linguagem direta:

> "The ANDROID_ID value won't change on package uninstall/reinstall, as long as the package name and signing key are the same. Apps can rely on this value to maintain state across reinstalls."
> — Android Developers Blog, *Changes to Device Identifiers in Android O* [3]

> "The Android ID value only changes if the device is factory reset or if the signing key rotates between uninstall and reinstall events."

A partir do Android 8.0 (API 26), o ANDROID_ID é um número de 64 bits, único por **combinação de chave de assinatura do app + usuário + dispositivo** [4].

### 1.3 A exceção histórica (irrelevante para "o que está no campo hoje")

Apps instalados **antes** de o dispositivo receber uma atualização OTA para Android 8.0+ tiveram seu ANDROID_ID trocado na primeira desinstalação/reinstalação pós-OTA (migração de esquema, one-time) [4]. Irrelevante hoje: qualquer device em campo em 2025/2026 rodando Android 10–15 nasceu (ou foi resetado) já em Android 8+.

### 1.4 Muda em Android 12–15?

Não foi encontrada nenhuma mudança documentada nesse comportamento entre Android 8 e Android 15 — a arquitetura do SSAID permanece a mesma na base AOSP até o `master` atual [1].

### 1.5 Diferença em OEMs (Samsung, Xiaomi, etc.)

**Não foi localizada nenhuma documentação primária** de que skins OEM resetem o SSAID no uninstall/reinstall de forma diferente do AOSP — a arquitetura é herdada diretamente. Suposições de divergência de OEM não têm lastro documental encontrado.

### 1.6 Nuances residuais

- **Factory reset** — sempre reseta [3].
- **Rotação da chave de assinatura** entre desinstalação e reinstalação (ex.: mudança de chave efetiva via Play App Signing) — reseta [3][4].
- **Múltiplos usuários/perfis de trabalho** — valor por combinação app+usuário; muda por perfil [3].
- **Emuladores** — muitos retornam o mesmo ANDROID_ID fixo (`9774d56d682e549c` clássico) — fonte de "colisões" mal interpretadas como bug de produção.

---

## 2. Identificadores alternativos — levantamento

### 2.1 OAID (Open Anonymous Device Identifier)

Padrão da MSA (China), adotado por Huawei/Xiaomi/Oppo/Vivo em builds sem Google Play Services [5][6]. Requer SDK de terceiro. Persistente por padrão mas resettable pelo usuário. **Relevância fora da China: baixa/nula.**

### 2.2 Widevine Device ID (DRM)

`MediaDrm(WIDEVINE_UUID).getPropertyByteArray(PROPERTY_DEVICE_UNIQUE_ID)` — hardware-bound, sobrevive uninstall/reinstall e até factory reset em muitos devices [7]. **Mas**: é uma API de DRM (proteção de conteúdo), não endossada pela Google como identificador de app. Associada a técnicas de fingerprinting não sancionado/malware desde o fechamento do IMEI no Android 10 [9]. Risco real de enforcement de política da Play Store — não recomendável.

### 2.3 Key Attestation (Android Keystore)

Mecanismo **por par de chaves**, não identificador de dispositivo. Prova que uma chave específica reside em hardware seguro (TEE/StrongBox) [12][13]. O "Unique ID" de 128 bits no certificado é limitado no tempo (rotaciona) — não serve como ID estável de longo prazo. ID Attestation (serial/IMEI no certificado) exige as mesmas permissões privilegiadas de sempre.

### 2.4 IMEI / Serial / MEID

Desde **Android 10**, requer `READ_PRIVILEGED_PHONE_STATE` — apps de terceiros da Play Store **não conseguem declarar essa permissão** [14][15]. Completamente inacessível para um app comum.

### 2.5 Endereço MAC

Randomizado por rede desde Android 6, habilitado por padrão desde Android 10. `WifiManager.getMacAddress()` retorna valor constante (`02:00:00:00:00:00`) para apps comuns desde Android 10 [14][17][18].

### 2.6 Play Integrity API — `deviceRecognitionVerdict`

Veredito qualitativo (`MEETS_BASIC/DEVICE/STRONG_INTEGRITY`) sobre o estado do dispositivo **no momento da requisição** [19]. Explicitamente **não** vinculado a identificadores de usuário/dispositivo [20], atrelado a um nonce por requisição para prevenir replay [21] — não é (nem pretende ser) um identificador persistente. Existe um recurso separado, **Device Recall** (beta), especificamente para detectar reuso de dispositivo preservando privacidade — sem expor um ID bruto [22].

---

## 3. Veredito final

**A alegação de que o ANDROID_ID sobrevive a uninstall/reinstall é factualmente correta**, com confirmação em fonte primária (blog oficial + arquitetura AOSP). A confusão comum na internet vem de três fontes:
1. Comportamento pré-Android 8 (ID único por dispositivo, histórico de bugs).
2. A exceção one-time de migração OTA — hoje irrelevante.
3. Confusão com GAID, que É resetável e não deve ser confundido com ANDROID_ID/SSAID.

**Respondendo à pergunta central — existe algum identificador que (a) não exige permissão que um app comum consiga obter, e (b) sobrevive de forma confiável a uninstall+reinstall?**

**SIM — o próprio ANDROID_ID.** É o único identificador nativo do Android que cumpre ambos os critérios de forma limpa, documentada, sem gambiarras, sem violar políticas, sem depender de SDK de terceiro (OAID) ou heurística não sancionada (Widevine).

**Ressalva honesta:** o ANDROID_ID não sobrevive a factory reset nem a rotação de chave de assinatura. Para esses cenários, não há solução nativa disponível para apps comuns — "nada sobrevive de forma confiável" é correto *especificamente* para esse escopo mais amplo. Mas para "sobreviver a uninstall+reinstall simples, mesmo device, mesmo pacote, mesma assinatura" — o ANDROID_ID é uma solução real e gratuita.

## Fontes

[1] SettingsProvider.java — AOSP: https://cs.android.com/android/platform/superproject/+/master:frameworks/base/packages/SettingsProvider/src/com/android/providers/settings/SettingsProvider.java
[2] SettingsState.java — android.googlesource.com: https://android.googlesource.com/platform/frameworks/base/+/master/packages/SettingsProvider/src/com/android/providers/settings/SettingsState.java
[3] Android Developers Blog — "Changes to Device Identifiers in Android O" (2017): https://android-developers.googleblog.com/2017/04/changes-to-device-identifiers-in.html
[4] Settings.Secure.ANDROID_ID reference: https://learn.microsoft.com/ja-jp/dotnet/api/android.provider.settings.secure.androidid
[5] Singular Help Center — OAID: https://support.singular.net/hc/en-us/articles/30848622982299
[6] AppsFlyer Help Center — Android OAID: https://support.appsflyer.com/hc/en-us/articles/360006278797-Android-OAID-implementation-in-the-SDK
[7] media_drm_id (GitHub): https://github.com/Semedii/media_drm_id
[9] AWAKE — READ_PHONE_STATE / Widevine deviceUniqueId por malware: https://zahidaz.github.io/awake/permissions/phone/read-phone-state/
[12] Key and ID attestation — AOSP: https://source.android.com/docs/security/features/keystore/attestation
[13] Verify hardware-backed key pairs with key attestation: https://developer.android.com/privacy-and-security/security-key-attestation
[14] Privacy changes in Android 10: https://developer.android.com/about/versions/10/privacy/changes
[15] Device identifiers — AOSP: https://source.android.com/docs/core/connect/device-identifiers
[16] Immutable device IDs — AOSP: https://source.android.com/docs/core/permissions/immutable-device-ids
[17] Implement MAC randomization — AOSP: https://source.android.com/docs/core/connect/wifi-mac-randomization
[18] MAC randomization behavior — AOSP: https://source.android.com/docs/core/connect/wifi-mac-randomization-behavior
[19] Integrity verdicts — Play Integrity: https://developer.android.com/google/play/integrity/verdicts
[20] Secure the environment | Fraud prevention: https://developer.android.com/security/fraud-prevention/environment
[21] Overview of the Play Integrity API: https://developer.android.com/google/play/integrity/overview
[22] Detect repeat abuse using device recall (beta): https://developer.android.com/google/play/integrity/device-recall
