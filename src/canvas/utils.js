export const getEventCoordinates = (e) => ({
  x: e.touches ? e.touches[0].clientX : e.clientX,
  y: e.touches ? e.touches[0].clientY : e.clientY
});

export const getNodeCenter = (size) => {
  return {
    x: size.left + size.width / 2,
    y: size.top + size.height / 2
  };
};
