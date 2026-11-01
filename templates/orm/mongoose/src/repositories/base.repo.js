export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // ── READ ────────────────────────────────────────

  findById(id, projection = {}) {
    return this.model.findById(id, projection).lean();
  }

  findOne(filter = {}, projection = {}) {
    return this.model.findOne(filter, projection).lean();
  }

  findMany(filter = {}, projection = {}, options = {}) {
    return this.model
      .find(filter, projection)
      .sort(options.sort || {})
      .lean();
  }

  async paginate(filter = {}, { page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  exists(filter = {}) {
    return this.model.exists(filter);
  }

  count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  // ── WRITE ────────────────────────────────────────

  create(data) {
    return this.model.create(data);
  }

  createMany(data = []) {
    return this.model.insertMany(data);
  }

  update(filter, data, options = { returnDocument: 'after' }) {
    return this.model.findOneAndUpdate(filter, { $set: data }, options).lean();
  }

  updateById(id, data, options = { returnDocument: 'after' }) {
    return this.model.findByIdAndUpdate(id, { $set: data }, options).lean();
  }
  updateMany(filter, data, options = {}) {
    return this.model.updateMany(filter, { $set: data }, options);
  }

  upsert(filter, data) {
    return this.model
      .findOneAndUpdate(filter, { $set: data }, { returnDocument: 'after', upsert: true })
      .lean();
  }

  // ── DELETE ────────────────────────────────────────

  deleteById(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  deleteOne(filter) {
    return this.model.findOneAndDelete(filter).lean();
  }

  deleteMany(filter) {
    return this.model.deleteMany(filter);
  }
}