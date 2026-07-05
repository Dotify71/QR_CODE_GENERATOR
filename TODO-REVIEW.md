# QR Code Generator — Review & Refactor Checklist

## Findings
- `downloadQR()` and `copyURL()` always use `size=500x500` even if user selected S/M/L.
- Opportunity to centralize QRServer URL construction to reduce duplication and ensure consistency.

## Planned changes
- [x] Refactor `script.js` to improve the shared QRServer URL builder (`buildQrUrl`).
- [x] Update `downloadQR()` to use currentSize/currentColor (and same screen-adjust logic) instead of hardcoded 500.
- [x] Update `copyURL()` to use currentSize/currentColor (and same screen-adjust logic) instead of hardcoded 500.
- [x] Keep preview generation working and consistent (it already uses the shared builder).
- [ ] Quick manual verification: generate, change size, download, copy.



