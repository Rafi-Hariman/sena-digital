# Node.js Upgrade Guide - WooCommerce Project

## Upgrade yang Dilakukan

### 1. Update Node.js Version
- **Versi Sebelumnya**: v18.20.8
- **Versi Baru**: v20.19.5
- **Alasan**: Mengatasi kompatibilitas dengan Angular CLI dan dependency terbaru

### 2. File yang Diupdate

#### package.json
```json
{
  "engines": {
    "node": ">=20.19.5",
    "npm": ">=10.0.0"
  }
}
```

#### .nvmrc
```
20.19.5
```

### 3. Dependencies yang Diupgrade
- Angular CLI: Diupgrade ke versi terbaru yang kompatibel dengan Node 20
- FontAwesome: Downgrade ke versi 5.15.4 untuk kompatibilitas

### 4. Cara Menggunakan

#### Menggunakan nvm untuk switch ke Node 20:
```bash
nvm use
# atau
nvm use v20.19.5
```

#### Install dependencies:
```bash
npm install
```

#### Jalankan development server:
```bash
ng serve
```

### 5. Masalah yang Diketahui

#### FontAwesome SVG Icons
- Saat ini ada masalah dengan FontAwesome SVG metadata yang menyebabkan error "Invalid version: 18.5-18.6"
- **Solusi Sementara**: FontAwesome SVG imports di-comment di `src/app/home/footer/footer.component.ts`
- **Akibat**: Icon FontAwesome mungkin tidak tampil sempurna, namun CSS tetap tersedia

#### Workaround untuk FontAwesome:
1. Gunakan FontAwesome CSS classes langsung di HTML
2. Hindari import SVG icons secara programatis untuk sementara
3. Alternatif: Gunakan icon library lain seperti Material Icons

### 6. Langkah Troubleshooting

Jika masih ada error:
1. Pastikan menggunakan Node v20.19.5: `node --version`
2. Clear cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
4. Restart development server

### 7. Rekomendasi Selanjutnya

1. **Upgrade Angular**: Pertimbangkan upgrade Angular dari v13 ke versi terbaru
2. **Update Dependencies**: Update dependency lain yang sudah deprecated
3. **Fix FontAwesome**: Cari solusi permanent untuk masalah FontAwesome SVG

### 8. Commands Reference

```bash
# Switch to Node 20
nvm use v20.19.5

# Set as default
nvm alias default v20.19.5

# Clean install
rm -rf node_modules package-lock.json
npm install

# Start development server
ng serve

# Build for production  
ng build --prod
```

## Catatan
Update ini berhasil mengatasi masalah kompatibilitas Node.js dengan Angular CLI, namun masih ada masalah minor dengan FontAwesome yang memerlukan solusi lebih lanjut.