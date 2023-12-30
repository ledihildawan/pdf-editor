const fonts = {
  Courier: {
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2 + size / 6;
    },
  },
  Helvetica: {
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2 + size / 10;
    },
  },
  'Times-Roman': {
    correction(size: number, lineHeight: number) {
      return (size * lineHeight - size) / 2 + size / 7;
    },
  },
};

export const Fonts = {
  ...fonts,
};
