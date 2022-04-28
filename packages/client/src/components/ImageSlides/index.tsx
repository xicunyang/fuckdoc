import React from 'react';
import ImageGallery from 'react-image-gallery';
import { getImageUrl } from './../../utils/index';

import './style.less';

interface IProps {
  images: string[];
}

const ImageSlides: React.FC<IProps> = ({ images }) => {
  const imageArr = images.map(img => ({
    original: getImageUrl(img)
  }));
  return <ImageGallery showPlayButton={false} items={imageArr} />;
};

export default ImageSlides;
