import qrcode
QR = "LMN044"
img = qrcode.make(QR)
type(img)  # qrcode.image.pil.PilImage
img.save(f"{QR}.png")
