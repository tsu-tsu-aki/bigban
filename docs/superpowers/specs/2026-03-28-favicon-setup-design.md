# Favicon Setup Design

## Overview

THE PICKLE BANG THEORY のファビコンを設定する。元素材 `public/logos/mark-neon.png` から各サイズのアイコンを生成し、Next.js App Router のファイルベース規約に従って配置する。

## Source Material

- **File**: `public/logos/mark-neon.png`
- **Dimensions**: 1227x749 (landscape, non-square, RGBA PNG)
- **Design**: Neon blue pickleball planet/ring logo on transparent background

## Approach: Simple Unified (Approach A)

All sizes use the same neon mark source. No size-specific optimization.

### Image Processing

1. Create a square canvas (1227x1227) with black background (#000000)
2. Center the mark-neon.png (1227x749) vertically on the canvas
3. Resize to each target size

### Output Files

| File | Size | Format | Purpose |
|------|------|--------|---------|
| `src/app/favicon.ico` | 16x16, 32x32, 48x48 | ICO (multi-size) | Browser tab |
| `src/app/icon.png` | 192x192 | PNG | General app icon |
| `src/app/apple-icon.png` | 180x180 | PNG | iOS home screen |

### Generation Tool

- `sharp` (available as Next.js transitive dependency)
- One-time Node.js script to generate all files, deleted after use

### layout.tsx

No changes required. Next.js App Router auto-discovers these files by convention.

## Testing

- Verify each file exists at expected path
- Verify image format (ICO / PNG)
- Verify image dimensions

## Out of Scope

- OGP image (`opengraph-image.png`)
- Web App Manifest (`manifest.json`)
- Dynamic icon generation (`icon.tsx`)
- Size-specific mark variants (white mark for small sizes)
