# Contribute dari Origin ke Upstream (devnolife)

Guide untuk contribute perubahan dari `FT-Super-Apps/vision-computer` kembali ke `devnolife/vision-computer`.

## Cara Contribute ke Upstream

### Metode 1: Pull Request via GitHub (Recommended) ✅

Ini cara standard dan paling aman untuk contribute ke upstream.

#### Step 1: Push Perubahan ke Origin

```bash
# 1. Pastikan perubahan sudah di-commit
git add .
git commit -m "feat: deskripsi perubahan yang jelas"

# 2. Push ke branch di origin (repo Anda)
git push origin feature/nama-fitur
```

#### Step 2: Buat Pull Request di GitHub

1. **Buka repo Anda di GitHub:**
   ```
   https://github.com/FT-Super-Apps/vision-computer
   ```

2. **Klik "Compare & pull request"**
   - GitHub akan otomatis detect branch yang baru di-push

3. **Atau buat manual:**
   - Klik tab "Pull requests"
   - Klik "New pull request"
   - Klik "compare across forks"
   - **Base repository:** `devnolife/vision-computer` (upstream)
   - **Base branch:** `main`
   - **Head repository:** `FT-Super-Apps/vision-computer` (origin)
   - **Compare branch:** `feature/nama-fitur`

4. **Isi detail Pull Request:**
   ```markdown
   ## Summary
   Deskripsi singkat perubahan

   ## Changes
   - Perubahan 1
   - Perubahan 2
   - Perubahan 3

   ## Test Plan
   Bagaimana cara test perubahan ini

   ## Screenshots (jika ada)
   [Screenshot atau video]
   ```

5. **Klik "Create pull request"**

6. **Tunggu review dari devnolife**
   - devnolife akan review code Anda
   - Mungkin ada request changes
   - Setelah approved, devnolife akan merge

#### Step 3: Update Branch Jika Ada Request Changes

```bash
# 1. Buat perubahan yang diminta
# Edit files...

# 2. Commit perubahan
git add .
git commit -m "fix: address review comments"

# 3. Push ke branch yang sama
git push origin feature/nama-fitur

# Pull Request akan otomatis ter-update!
```

---

### Metode 2: Request Write Access (Jika Collaborator)

Jika devnolife memberikan Anda write access, baru bisa direct push:

```bash
# Push langsung ke upstream (hanya jika punya permission)
git push upstream main

# Tapi tetap recommended pakai PR untuk code review!
```

---

## Workflow Lengkap: Development → Contribute

### 1. Sync dengan Upstream (Sebelum Development)

```bash
# Ambil update terbaru dari devnolife
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 2. Create Feature Branch

```bash
# Buat branch dari main terbaru
git checkout -b feature/nama-fitur

# Development...
# Edit files, test, dll
```

### 3. Commit Changes

```bash
# Stage perubahan
git add .

# Commit dengan message yang jelas
git commit -m "feat: add user progress monitoring

- Add jobId tracking to Document model
- Create admin job monitor page
- Enhance user progress display with real-time updates
- Add progress percentage and status tracking
"
```

### 4. Push ke Origin

```bash
# Push ke repo Anda
git push origin feature/nama-fitur
```

### 5. Create Pull Request di GitHub

Ikuti Step 2 di atas untuk buat PR ke devnolife.

---

## Best Practices

### Commit Messages

Gunakan format conventional commits:

```bash
# Format
<type>: <subject>

<body>

<footer>

# Types:
feat:     Fitur baru
fix:      Bug fix
docs:     Dokumentasi
style:    Formatting, semicolon, dll (tidak mengubah code)
refactor: Refactoring code
test:     Menambah/update tests
chore:    Build tasks, package manager configs, dll

# Contoh:
git commit -m "feat: add real-time job monitoring for admin

- Create admin job monitor page with live updates
- Add progress tracking to document processing
- Display job status, percentage, and estimated time
- Auto-refresh every 5 seconds

Closes #123"
```

### Pull Request Best Practices

1. **Branch naming:**
   ```bash
   feature/nama-fitur    # Fitur baru
   fix/nama-bug          # Bug fix
   docs/update-readme    # Update dokumentasi
   refactor/improve-perf # Refactoring
   ```

2. **Keep PR small:**
   - 1 PR = 1 fitur/fix
   - Mudah di-review
   - Cepat di-merge

3. **Test sebelum PR:**
   - Pastikan semua test pass
   - Test manual di browser
   - Check console errors
   - Test di production build

4. **Clear description:**
   - Jelaskan apa yang diubah
   - Kenapa diubah
   - Bagaimana cara test

---

## Check Status

### Cek Apakah Bisa Push ke Upstream

```bash
# Cek remote settings
git remote show upstream

# Jika muncul "Permission denied", berarti harus pakai PR
# Jika berhasil, berarti punya write access
```

### Cek Branch yang Belum Di-Push ke Upstream

```bash
# Lihat commit yang ada di origin tapi belum di upstream
git log upstream/main..origin/main

# Lihat perbedaan files
git diff upstream/main origin/main
```

---

## Troubleshooting

### Error: Permission Denied

```bash
$ git push upstream main
ERROR: Permission to devnolife/vision-computer.git denied
```

**Solusi:** Gunakan Pull Request (Metode 1)

### Error: Conflict dengan Upstream

```bash
# Fetch upstream terbaru
git fetch upstream

# Rebase branch Anda di atas upstream/main
git checkout feature/nama-fitur
git rebase upstream/main

# Resolve conflicts jika ada
# Edit files, kemudian:
git add .
git rebase --continue

# Force push ke origin (karena history berubah)
git push origin feature/nama-fitur --force-with-lease
```

### Pull Request Conflict di GitHub

Jika PR Anda conflict dengan main branch di upstream:

```bash
# 1. Sync dengan upstream terbaru
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 2. Merge main ke feature branch
git checkout feature/nama-fitur
git merge main

# 3. Resolve conflicts
# Edit files yang conflict...
git add .
git commit -m "fix: resolve merge conflicts"

# 4. Push
git push origin feature/nama-fitur

# PR akan otomatis ter-update dan conflict resolved!
```

---

## Summary

### Dari Origin → Upstream (Contribute)

| Metode | Bisa? | Cara |
|--------|-------|------|
| Direct Push | ❌ Tidak | Perlu write access dari devnolife |
| Pull Request | ✅ Ya | Create PR di GitHub (recommended!) |

### Workflow Singkat

```bash
# 1. Sync dengan upstream
git fetch upstream && git checkout main && git merge upstream/main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Development & commit
git add . && git commit -m "feat: description"

# 4. Push ke origin
git push origin feature/new-feature

# 5. Create Pull Request di GitHub
# Buka https://github.com/FT-Super-Apps/vision-computer
# Klik "Compare & pull request"
# Base: devnolife/vision-computer:main
# Compare: FT-Super-Apps/vision-computer:feature/new-feature
# Create PR!

# 6. Tunggu review & merge dari devnolife
```

---

## Resources

- [GitHub PR Documentation](https://docs.github.com/en/pull-requests)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Rebase Tutorial](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)

---

**Note:** Fork relationship mungkin terputus di UI, tapi Pull Request tetap bisa dibuat dengan memilih "compare across forks"!
