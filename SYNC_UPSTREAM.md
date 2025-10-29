# Sync dengan Upstream devnolife/vision-computer

Meskipun fork relationship di GitHub terputus, upstream remote masih berfungsi normal!

## Check Status Upstream

```bash
# Cek remote yang terhubung
git remote -v

# Seharusnya muncul:
# origin     https://github.com/FT-Super-Apps/vision-computer
# upstream   https://github.com/devnolife/vision-computer.git
```

## Sync dengan Upstream

### 1. Fetch Update dari Upstream

```bash
# Ambil semua update dari devnolife
git fetch upstream

# Lihat branch apa saja yang ada
git branch -r
```

### 2. Merge Update ke Branch Lokal

```bash
# Pastikan di branch main
git checkout main

# Merge update dari upstream/main
git merge upstream/main

# Atau gunakan rebase untuk history yang lebih bersih
git rebase upstream/main
```

### 3. Push ke Origin (Repo Anda)

```bash
# Push perubahan ke repo FT-Super-Apps
git push origin main
```

## Sync Branch Tertentu

Jika devnolife punya branch lain yang ingin Anda ambil:

```bash
# Fetch branch tertentu
git fetch upstream branch-name

# Create branch lokal dari upstream
git checkout -b branch-name upstream/branch-name

# Push ke origin
git push origin branch-name
```

## Workflow Reguler

### Saat Mulai Development

```bash
# 1. Fetch latest dari upstream
git fetch upstream

# 2. Update branch main lokal
git checkout main
git merge upstream/main

# 3. Push ke origin
git push origin main

# 4. Create feature branch
git checkout -b feature/new-feature

# 5. Development...
# 6. Commit & push ke origin
git push origin feature/new-feature
```

### Saat Ada Update di Upstream

```bash
# Pull update terbaru dari devnolife
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Update feature branch dengan main terbaru
git checkout feature/your-feature
git merge main
# atau
git rebase main
```

## Tips

1. **Selalu fetch upstream sebelum mulai coding baru**
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Resolve conflicts jika ada**
   - Git akan memberitahu jika ada conflict
   - Edit file yang conflict
   - `git add .` dan `git commit`

3. **Keep main branch clean**
   - Jangan langsung coding di main
   - Selalu buat feature branch baru

4. **Regular sync**
   - Sync dengan upstream minimal seminggu sekali
   - Atau sebelum mulai feature baru

## Perintah Cepat

```bash
# Quick sync dengan upstream
git fetch upstream && git checkout main && git merge upstream/main && git push origin main

# Create feature branch dari main terbaru
git checkout main && git pull origin main && git fetch upstream && git merge upstream/main && git checkout -b feature/nama-feature
```

## Catatan

- Fork relationship di GitHub UI memang terputus karena repo pernah private
- **Tapi secara fungsional tidak ada masalah!**
- Semua git operations tetap berfungsi normal
- Anda masih bisa ambil semua update dari devnolife
- Hanya tampilan "forked from" di GitHub yang tidak muncul

## Troubleshooting

### Jika upstream tidak ada:
```bash
git remote add upstream https://github.com/devnolife/vision-computer.git
```

### Jika URL upstream salah:
```bash
git remote set-url upstream https://github.com/devnolife/vision-computer.git
```

### Jika ingin lihat perbedaan dengan upstream:
```bash
git fetch upstream
git diff main upstream/main
```
