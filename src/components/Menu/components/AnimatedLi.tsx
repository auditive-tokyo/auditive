import React from 'react';
import { animated } from 'react-spring';
import { SpringValue } from 'react-spring';

// Animated list item with spring animations
export const AnimatedLi = animated.li as unknown as React.FC<
  Omit<React.LiHTMLAttributes<HTMLLIElement>, 'style'> & { 
    style?: {
      transform?: SpringValue<string>;
      opacity?: SpringValue<number>;
      y?: SpringValue<number>;
      color?: SpringValue<string>;
      [key: string]: SpringValue<any> | undefined;
    }
  }
>;

export default AnimatedLi;