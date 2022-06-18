const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from being matched
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and remove them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create opertators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Find all bootcamps - parse 'queryStr' to object to use it for searching
  query = model.find(JSON.parse(queryStr));

  // Select only specific fields to show on result
  if (req.query.select) {
    // The 'req.query.select' has its values separated by ','
    // E.g: localhost:3000/api/v1/bootcamps?select=name,description
    // So remove the ',' between 'name' and 'description' and pass it to 'query.select()'
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort by a colum user chose. If not, sort by date
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Page number
  const page = parseInt(req.query.page, 10) || 1;
  // Limit per page
  const limit = parseInt(req.query.limit, 10) || 2;
  // Start index on each page
  const startIndex = (page - 1) * limit;
  // End index on each page
  const endIndex = page * limit;
  const total = await model.countDocuments();

  // Number of docs to skip on each page and docs limit per page
  query = query.skip(startIndex).limit(limit);

  // Populate
  if (populate) {
    query = query.populate(populate);
  }

  // Execute the query
  const results = await query;

  // Pagination object
  const pagination = {};

  // If endIndex is less than the total document count, add 'next' button
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  // If startIndex is greater than zero, add 'prev' button
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // Prepare response object for later reuse
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

// Export
module.exports = advancedResults;
