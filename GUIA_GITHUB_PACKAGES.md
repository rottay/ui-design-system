# Guía para Publicar en GitHub Packages

## 📋 Requisitos Previos

1. **Cuenta de GitHub** con acceso al repositorio
2. **Personal Access Token (PAT)** con scopes:
   - `write:packages`
   - `read:packages`
   - `delete:packages` (opcional)
3. **Repositorio GitHub** existente o nuevo

---

## 🔧 Configuración Necesaria

### 1. Archivos a Modificar/Crear

#### `packages/core/package.json`
```json
{
  "name": "@TU-USUARIO/design-system-core",
  "version": "0.1.0",
  "description": "Design System Multi-Tema basado en Ant Design",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/TU-USUARIO/TU-REPO.git"
  },
  "keywords": [
    "design-system",
    "react",
    "antd",
    "themes",
    "components"
  ],
  "author": "Tu Nombre",
  "license": "MIT"
}
```

#### `.npmrc` (raíz del proyecto)
```ini
@TU-USUARIO:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

#### `.github/workflows/publish.yml`
```yaml
name: Publish to GitHub Packages

on:
  release:
    types: [created]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to publish (e.g., 0.1.0)'
        required: false

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@TU-USUARIO'

      - name: Install dependencies
        run: npm ci

      - name: Build package
        run: npm run build --workspace=@designsystem/core

      - name: Publish to GitHub Packages
        run: npm publish --workspace=@designsystem/core
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📝 Pasos Detallados

### **Paso 1: Preparar el Repositorio**

1. **Inicializar Git (si no está hecho):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `design-system` (o el que prefieras)
   - Visibilidad: Público o Privado
   - Click en "Create repository"

3. **Conectar repositorio local:**
   ```bash
   git remote add origin https://github.com/TU-USUARIO/design-system.git
   git branch -M main
   git push -u origin main
   ```

---

### **Paso 2: Configurar Personal Access Token**

1. **Crear PAT:**
   - Ve a: https://github.com/settings/tokens
   - Click en "Generate new token" → "Generate new token (classic)"
   - Nombre: `design-system-packages`
   - Scopes requeridos:
     - ✅ `write:packages`
     - ✅ `read:packages`
     - ✅ `repo` (si el repo es privado)
   - Click en "Generate token"
   - **COPIA EL TOKEN** (lo usarás después)

2. **Configurar localmente:**
   ```bash
   # Linux/macOS
   export GITHUB_TOKEN=ghp_TuTokenAqui

   # Windows PowerShell
   $env:GITHUB_TOKEN="ghp_TuTokenAqui"

   # Windows CMD
   set GITHUB_TOKEN=ghp_TuTokenAqui
   ```

---

### **Paso 3: Actualizar Configuración del Proyecto**

1. **Modificar `packages/core/package.json`:**
   - Cambiar `@TU-USUARIO` por tu usuario de GitHub
   - Cambiar URL del repositorio
   - Verificar versión (empezar en `0.1.0`)

2. **Crear archivo `.npmrc` en raíz:**
   ```ini
   @TU-USUARIO:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. **Actualizar `.gitignore`:**
   ```gitignore
   # Agregar si no existe
   .npmrc
   .env
   *.local
   ```

---

### **Paso 4: Crear GitHub Action**

1. **Crear estructura de carpetas:**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Crear archivo `.github/workflows/publish.yml`**
   (Usar el contenido de arriba, reemplazando `@TU-USUARIO`)

---

### **Paso 5: Build y Test Local**

```bash
# Instalar dependencias
npm install

# Build del paquete
npm run build --workspace=@designsystem/core

# Verificar que dist/ se generó correctamente
ls packages/core/dist
# Deberías ver: index.js, index.cjs, index.d.ts
```

---

### **Paso 6: Publicación Manual (Primera vez)**

```bash
# Asegúrate de tener GITHUB_TOKEN configurado
echo $GITHUB_TOKEN  # Linux/macOS
echo %GITHUB_TOKEN% # Windows CMD
echo $env:GITHUB_TOKEN # Windows PowerShell

# Hacer login
npm login --registry=https://npm.pkg.github.com --scope=@TU-USUARIO

# Build
npm run build --workspace=@designsystem/core

# Publicar
npm publish --workspace=@designsystem/core
```

---

### **Paso 7: Publicación Automática con GitHub Actions**

**Opción A: Con Release en GitHub**
1. Ve a tu repo en GitHub
2. Click en "Releases" → "Create a new release"
3. Tag version: `v0.1.0`
4. Release title: `v0.1.0`
5. Description: Changelog
6. Click "Publish release"
7. GitHub Actions se ejecutará automáticamente

**Opción B: Trigger Manual**
1. Ve a "Actions" en tu repo
2. Click en "Publish to GitHub Packages"
3. Click "Run workflow"
4. (Opcional) Ingresa versión
5. Click "Run workflow"

---

### **Paso 8: Verificar Publicación**

1. **En GitHub:**
   - Ve a tu repositorio
   - Click en "Packages" (lado derecho)
   - Deberías ver `design-system-core`

2. **Información del paquete:**
   ```
   https://github.com/TU-USUARIO/TU-REPO/packages/
   ```

---

## 📦 Uso del Paquete Publicado

### **En Proyectos Next.js**

1. **Crear `.npmrc` en el proyecto:**
   ```ini
   @TU-USUARIO:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=TU_GITHUB_TOKEN
   ```

2. **Instalar:**
   ```bash
   npm install @TU-USUARIO/design-system-core
   # o
   pnpm add @TU-USUARIO/design-system-core
   ```

3. **Usar:**
   ```tsx
   import { Button, ThemeProvider } from '@TU-USUARIO/design-system-core';

   export default function App() {
     return (
       <ThemeProvider defaultTheme="spotify">
         <Button type="primary">Hello</Button>
       </ThemeProvider>
     );
   }
   ```

---

## 🔄 Workflow de Versiones

### **Actualizar versión:**
```bash
# En packages/core/
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.1 → 0.2.0
npm version major  # 0.2.0 → 1.0.0
```

### **Publicar nueva versión:**
```bash
# Hacer commit del cambio de versión
git add packages/core/package.json
git commit -m "chore: bump version to 0.1.1"
git push

# Crear release en GitHub (esto triggerea la publicación)
git tag v0.1.1
git push origin v0.1.1
```

---

## 🛠️ Troubleshooting

### Error: "401 Unauthorized"
- Verificar que `GITHUB_TOKEN` esté configurado
- Verificar que el token tenga scope `write:packages`

### Error: "404 Not Found"
- Verificar que `@TU-USUARIO` coincida con tu usuario de GitHub
- Verificar URL del repositorio en `package.json`

### Error: "Package already exists"
- Incrementar versión en `package.json`
- O eliminar versión existente en GitHub Packages

---

## 📊 Checklist Final

- [ ] Repositorio GitHub creado
- [ ] Personal Access Token generado
- [ ] `package.json` actualizado con nombre correcto (`@TU-USUARIO/...`)
- [ ] `publishConfig.registry` apuntando a GitHub Packages
- [ ] `.npmrc` creado en raíz
- [ ] GitHub Action creado (`.github/workflows/publish.yml`)
- [ ] Build local exitoso (`npm run build`)
- [ ] Primera publicación manual exitosa
- [ ] Paquete visible en GitHub Packages
- [ ] Probado en proyecto de prueba

---

## 🔗 Referencias

- [GitHub Packages Docs](https://docs.github.com/en/packages)
- [Publishing npm packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

---

**Nota:** Reemplaza `TU-USUARIO` y `TU-REPO` con tus valores reales en todos los archivos.
