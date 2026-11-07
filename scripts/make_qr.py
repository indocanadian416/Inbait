"""Dev-time only: generate site/assets/qr-quishing.svg.

Run locally:  pip install qrcode  &&  python scripts/make_qr.py
The QR points at the Inbait quishing lesson, so anyone who scans it learns something.
"""
from pathlib import Path

import qrcode
import qrcode.image.svg

URL = "https://indocanadian416.github.io/Inbait/#/learn/quishing"
OUT = Path(__file__).resolve().parent.parent / "site" / "assets" / "qr-quishing.svg"

qr = qrcode.QRCode(border=2, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data(URL)
qr.make(fit=True)
img = qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage)
img.save(str(OUT))
print(f"Wrote {OUT} -> {URL}")
