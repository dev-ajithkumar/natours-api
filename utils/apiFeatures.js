class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1A. Filtering - Remove unwanted fields from the query object
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B. Advanced filtering - Convert query object to MongoDB query format
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // 2. Sorting - Apply sorting to the query results
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  fieldLimits() {
    // 3. Field Limits - Select specific fields to be included/excluded from the query results
    if (this.queryString.fields) {
      let selectFields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    // 4. Pagination - Apply pagination to the query results
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
