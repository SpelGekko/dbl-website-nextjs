import qrcode
from PIL import Image
import os

# URL for which we want to generate the QR code
url = "https://american-aviators.thorvaldrovers.com"

# Creating an instance of QRCode class
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

# Adding URL to QRCode instance
qr.add_data(url)
qr.make(fit=True)

# Creating an image from the QR Code instance
img = qr.make_image(fill_color="black", back_color="white")

# Save the image
output_file = "american_aviators_qrcode.png"
img.save(output_file)

print(f"QR code generated successfully and saved as '{output_file}'")
print(f"QR code links to: {url}")