# Rhino Kids — App Store Yayın Adımları (İŞ F)

Bu makinede yalnızca **Command Line Tools** kurulu (tam Xcode ve CocoaPods yok),
o yüzden iOS native adımları **senin Xcode'lu makinende** çalıştırılmalı.
Aşağıdaki sıra birebir izlenebilir.

## 0. Ön koşullar (senin makinende, bir kez)
```bash
# Tam Xcode (App Store'dan) kurulu olmalı, sonra:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -version          # doğrula
sudo gem install cocoapods   # veya: brew install cocoapods
pod --version                # doğrula
```

## 1. Web build (her iki makinede de çalışır)
```bash
npm install
npm run build                # dist/ üretir — tsc temiz olmalı
```

## 2. Native platformları ekle
```bash
npx cap add ios
npx cap add android          # (Android Studio + SDK gerekir; istersen sonra)
```

## 3. İkon + açılış ekranı üret
Kaynak görseller `assets/` içinde hazır:
- `assets/icon.svg`        — 1024×1024 uygulama ikonu (opak savana zemini + Reno)
- `assets/splash.svg`      — açılış ekranı (Reno + "Rhino Kids")
- `assets/splash-dark.svg` — koyu mod açılış ekranı

`@capacitor/assets` devDependency olarak ekli. Platform klasörleri eklendikten
SONRA çalıştır (ios/ ve/veya android/ mevcut olmalı):
```bash
npx capacitor-assets generate            # tüm boyutları üretir
# yalnızca iOS için:  npx capacitor-assets generate --ios
```
> Not: araç PNG ister; SVG'leri otomatik PNG'ye çevirmezse, `assets/icon.svg`
> ve `assets/splash.svg`'yi 1024×1024 / 2732×2732 PNG olarak export edip
> `assets/icon.png` + `assets/splash.png` olarak koy, sonra komutu tekrar çalıştır.

## 4. Senkronize et + Xcode'da aç
```bash
npx cap sync ios
npx cap open ios             # Xcode açılır
```
Xcode'da:
- **Signing & Capabilities** → kendi Apple Developer Team'ini seç.
- Bundle Identifier: `com.renan.rhinokids` (capacitor.config.ts ile aynı ✓).
- Gerçek bir iPad/iPhone bağlayıp **Run** ile cihazda test et.

## 5. App Store Connect
- **Privacy Policy URL:** `PRIVACY.md` içeriğini herkese açık bir URL'de yayınla
  (GitHub Pages / Notion / kişisel site). İletişim e-postası: h.yalnizcan@gmail.com.
- **App Privacy (Data Collection):** "Data Not Collected" seç — uygulama
  hiçbir veri toplamıyor (kodla doğrulandı: 0 ağ çağrısı).
- **Age Rating:** 4+ (eğitici, şiddet/uygunsuz içerik yok).
- **Kategori:** Education (veya Kids > 5 & Under).
- **Ekran görüntüleri (Apple şartı):** iPad için en az 3. `npm run dev` ile
  uygulamayı aç, iPad çözünürlüğünde (ör. 2048×2732) Home / bir modül / rozet
  vitrini ekranlarından al. (Bu repodaki testlerde Chrome ile alınan
  görüntüler örnek; mağaza için gerçek cihaz/simülatör görüntüsü tercih edilir.)

## Durum (bu oturumda yapıldı)
- [x] `npm run build` temiz, `dist/` üretiliyor
- [x] `capacitor.config.ts`: appId `com.renan.rhinokids`, appName "Rhino Kids" ✓
- [x] `index.html` mağaza metadata'sı (başlık, lang=tr, theme-color, Apple PWA meta)
- [x] `PRIVACY.md` (KVKK + COPPA, iletişim e-postası dolu)
- [x] `assets/` ikon + splash SVG'leri (Reno temalı)
- [x] `@capacitor/assets` devDependency
- [ ] `npx cap add ios` — senin Xcode'lu makinende
- [ ] `npx capacitor-assets generate` — platform eklendikten sonra
- [ ] Xcode'da imzalama + cihaz testi
- [ ] App Store Connect yükleme
