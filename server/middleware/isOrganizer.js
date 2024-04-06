const checkIsOrganizer = (req, res, next) => {
    console.log(req.user.isOrganizer);
    if (!req.user.isOrganizer) {
      return res.status(403).json({ success: false, message: 'User is not an organizer', statusCode: 403 });
    }
    next();
  }

  export default checkIsOrganizer;