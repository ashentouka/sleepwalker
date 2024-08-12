import cv2
import numpy as np
import sys

#load image into variable
img_rgb = cv2.imread(sys.argv[2])

#load template
template = cv2.imread(sys.argv[1])

#read height and width of template image
w, h = template.shape[0], template.shape[1]

res = cv2.matchTemplate(img_rgb,template,cv2.TM_CCOEFF_NORMED)
threshold = 0.8
loc = np.where( res >= threshold)
for pt in zip(*loc[::-1]):
	print("[", pt[0]+(w/2), ",", pt[1]+(h/2), "]")