import Log from "../models/log.model.js";

export const createLog = async ({
  adminEmail,
  action,
  module,
  targetId = null,
  targetName = null,
  status = "success",
  req = null,
}) => {
  try {
    const log = new Log({
      adminEmail,
      action,
      module,
      targetId,
      targetName,
      status,
      ipAddress: req?.ip || "unknown",
      userAgent: req?.headers["user-agent"] || "unknown",
    });
    await log.save();
  } catch (error) {
    console.error("Failed to create admin log:", error.message);
  }
};
