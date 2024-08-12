# Only for Type-Hints
from typing import TypeVar, Sequence, Union
from pathlib import Path
from os import PathLike
from argparse import ArgumentParser

accepted_image_types = TypeVar("accepted_image_types", Path, Union[PathLike[str], str], bytes, Sequence[Path], Sequence[Union[PathLike[str], str]], Sequence[bytes])

parser = ArgumentParser("escapecha.matcher")
parser.add_argument("img")
parser.add_argument("hint")
args = parser.parse_args()

from recognizer import Detector

detector = Detector()

task_type: str = args.hint
images: accepted_image_types = args.img
area_captcha: bool = False

response, coordinates = detector.detect(task_type, images, area_captcha=area_captcha)