# DoriQidir reja va dizayn

## Muammo va yechim
Odamlar kerakli dori qaysi dorixonada borligini bilmay, bir nechta manzilni aylanadi. DoriQidir katalogni hudud bo‘yicha qidirish, narx va zaxirani ko‘rish hamda borishdan oldin ajratish imkonini beradi.

## Arxitektura
Node.js built-in HTTP server REST API va statik frontendni bitta portda beradi. JSON fayl kichik dorixonalar uchun boshlang‘ich persistent data store. `medicines` zaxiralarni, `pharmacies` manzil ma’lumotlarini, `reservations` buyurtma oqimini saqlaydi. Admin endpointlari `x-admin-key` rol chegarasi bilan yopilgan.

## Dizayn
Uch variant: “clinic ledger” (0.06), “warm pharmacy” (0.08), “green utility” (0.04). Tanlov: **green utility**.

- Design movement: Swiss utility + zamonaviy apteka signalizatsiyasi.
- Core principles: tez skanerlash, ortiqcha bezaksiz ishonch, mavjudlikni birinchi o‘ringa qo‘yish, telefon uchun qulaylik.
- Color philosophy: yashil — sog‘liq va ishonch; lime — harakat/CTA; oq-qog‘oz fon — xotirjamlik.
- Layout paradigm: chapdan o‘ngga oqadigan qidiruv paneli va zich ikki ustunli natijalar.
- Signature elements: `+` belgili logomark, mint pill icon, mono-spaced micro-labels.
- Typography: Manrope sarlavhalar uchun, DM Mono ma’lumot yorliqlari uchun.
- Brand voice: “Kerakli dori qayerda bor?” va “Navbatsiz olib keting.”
- Brand essence: dorini izlashni manzil qidirishdan bir qadamga aylantiradi; aniq, amaliy, xotirjam.

## Tuzilma
`server.js` REST va static serving; `data/doriqidir.json` ma’lumotlar; `public/index.html`, `style.css`, `app.js` foydalanuvchi interfeysi; `test.js` smoke testlar; `docs/architecture.svg` vizual hujjat.
