# API Configuration Update

## Perubahan yang Dilakukan

### 1. Environment Production (environment.prod.ts)
- **URL Lama**: `https://sena-digital.com/api`
- **URL Baru**: `https://www.sena-digital.com/api`

### 2. Proxy Configuration (proxy.conf.json)
- **Target Lama**: `https://sena-digital.com/api`
- **Target Baru**: `https://www.sena-digital.com/api`
- **Secure**: Diubah dari `false` ke `true` (untuk HTTPS)
- **Tambahan**: `logLevel: "debug"` untuk debugging

## File yang Dimodifikasi

### src/environments/environment.prod.ts
```typescript
export const environment: Environment = {
  production: true,
  apiBaseUrl: 'https://www.sena-digital.com/api'
};
```

### proxy.conf.json
```json
{
  "/api": {
    "target": "https://www.sena-digital.com/api",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## Cara Testing

### Development Mode (dengan proxy)
```bash
ng serve
# API calls akan di-proxy ke https://www.sena-digital.com/api
```

### Production Build
```bash
ng build --prod
# Akan menggunakan https://www.sena-digital.com/api langsung
```

## Penjelasan Konfigurasi

### Proxy Configuration
- **target**: URL server backend
- **secure**: `true` untuk HTTPS, `false` untuk HTTP
- **changeOrigin**: Mengubah origin header untuk menghindari CORS
- **logLevel**: Level logging untuk debugging proxy

### Environment Production
- Digunakan saat build production (`ng build --prod`)
- API calls akan langsung ke `https://www.sena-digital.com/api`

### Environment Development
- Tetap menggunakan `http://127.0.0.1:8000/api` untuk development lokal
- Bisa diubah sesuai kebutuhan development

## Catatan
- Pastikan API di `https://www.sena-digital.com/api` sudah siap dan dapat diakses
- Test CORS policy jika ada masalah akses dari domain lain
- Gunakan `logLevel: "debug"` untuk debugging, hapus di production jika tidak diperlukan
