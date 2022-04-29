// 152kb
import { scanFile } from './../utils';
const sharp = require('sharp');
const path = require('path');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const deleteFile = require('delete');

async function startSharp() {
  const [imgFilePath] = await scanFile();
  const filtedImgPath = imgFilePath.filter((imgPath: string) => !imgPath.endsWith('.webp'));
  const imageTotal = filtedImgPath.length;

  if (imageTotal === 0) {
    console.log('\n');
    console.log(colors.green('🎉🎉🎉 已完成压缩 🎉🎉🎉'));
    console.log('\n');
    console.log(colors.green('fuckdoc 已将图片全部压缩为webp格式'));
    console.log('\n');
    return;
  }

  const progressBar = new cliProgress.SingleBar({
    format: `fuckdoc 图片压缩 |${colors.cyan('{bar}')}| {percentage}% || {value}/{total} images`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: false
  });

  progressBar.start(imageTotal, 0);

  let sharpedCount = 0;
  filtedImgPath.forEach(async (imagePath: string) => {
    const imgPathArr = imagePath.split('.');
    imgPathArr[imgPathArr.length - 1] = 'webp';
    const webpImgPath = imgPathArr.join('.');

    sharp(imagePath).toFile(webpImgPath, (err, info) => {
      deleteFile.sync([imagePath]);
      sharpedCount += 1;
      progressBar.update(sharpedCount);

      if (sharpedCount >= imageTotal) {
        setTimeout(() => {
          progressBar.stop();

          console.log('\n');
          console.log(colors.green('🎉🎉🎉 压缩完毕 🎉🎉🎉'));
          console.log('\n');
          console.log(colors.green('fuckdoc 已将图片全部压缩为webp格式'));
          console.log('\n');
        }, 500);
      }
    });
  });
}

export default startSharp;
