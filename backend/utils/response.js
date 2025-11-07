export const successResponse = (res, data, message = "Success") => {
  return res.json({
    success: true,
    message,
    data,
  });
};
