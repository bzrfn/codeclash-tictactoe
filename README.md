# CodeClash Tic Tac Toe

Aplicación móvil Expo + backend Socket.IO para jugar Tic-Tac-Toe multijugador por código.

## Funcionalidades
- Generar código de partida.
- Unirse escribiendo código.
- Dos jugadores en tiempo real.
- Serie de máximo 5 partidas.
- Gana quien llegue primero a 3 victorias.
- Si el marcador queda 2-2, la quinta partida define el ganador.
- Marcador, nombres de jugador, perfil local y modo claro/oscuro.
- Diseño personalizado con temática de programación/videojuego.

## Ejecución local

### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Mobile
```bash
cd mobile
npm install
cp .env.example .env
# En desarrollo físico reemplazar EXPO_PUBLIC_SOCKET_URL por la IP LAN o dominio HTTPS del backend.
npx expo start
```

## Producción
1. Publicar el backend en Render, Railway, VPS o servicio Node.js con HTTPS.
2. Configurar `EXPO_PUBLIC_SOCKET_URL=https://tu-dominio.com`.
3. Crear proyecto EAS y reemplazar `extra.eas.projectId` en app.json.
4. Generar APK interno:
```bash
eas build -p android --profile preview
```
5. Generar AAB para Play Store:
```bash
eas build -p android --profile production
```
6. Generar build iOS para App Store:
```bash
eas build -p ios --profile production
```
7. Enviar a tiendas con:
```bash
eas submit -p android --profile production
eas submit -p ios --profile production
```

## Nota importante
El proyecto incluye estructura y configuración lista para producción. Para publicar en App Store o Play Store se requieren cuentas de desarrollador, certificados, identificadores de paquete únicos y un backend público estable con HTTPS.
