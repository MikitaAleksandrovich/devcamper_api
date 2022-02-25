// @description Get all bootcamps
// @route       GET api/v1/bootcamps
// @accesss     Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
};

// @description Get single bootcamp
// @route       GET api/v1/bootcamps/:id
// @accesss     Public
exports.getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @description Create new bootcamp
// @route       POST api/v1/bootcamps
// @accesss     Public
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Create bootcamp" });
};

// @description Update bootcamp
// @route       PUT api/v1/bootcamps/:id
// @accesss     Public
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @description Delete bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @accesss     Public
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
