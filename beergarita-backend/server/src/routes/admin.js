const fs = require('fs');
const path = require('path');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Validation Schemas for admin POST/PUT routes
const venuePutSchema = {
  body: {
    type: 'object',
    required: ['title', 'address'],
    properties: {
      title: { type: 'string' },
      address: { type: 'string' },
      phone: { type: ['string', 'null'] },
      phone_href: { type: ['string', 'null'] },
      whatsapp: { type: ['string', 'null'] },
      maps_embed: { type: ['string', 'null'] },
      maps_link: { type: ['string', 'null'] },
      lat: { type: ['number', 'null'] },
      lng: { type: ['number', 'null'] }
    }
  }
};

const hoursSchema = {
  body: {
    type: 'object',
    required: ['label', 'hours'],
    properties: {
      label: { type: 'string' },
      hours: { type: 'string' },
      sort_order: { type: ['integer', 'null'] }
    }
  }
};

const socialSchema = {
  body: {
    type: 'object',
    required: ['title', 'url'],
    properties: {
      title: { type: 'string' },
      url: { type: 'string' },
      sort_order: { type: ['integer', 'null'] }
    }
  }
};

const categoryPostSchema = {
  body: {
    type: 'object',
    required: ['id', 'title'],
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      kicker: { type: ['string', 'null'] },
      photo_url: { type: ['string', 'null'] },
      sort_order: { type: ['integer', 'null'] },
      is_active: { type: ['boolean', 'null'] }
    }
  }
};

const categoryPutSchema = {
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string' },
      kicker: { type: ['string', 'null'] },
      photo_url: { type: ['string', 'null'] },
      sort_order: { type: ['integer', 'null'] },
      is_active: { type: ['boolean', 'null'] }
    }
  }
};

const productPostPutSchema = {
  body: {
    type: 'object',
    required: ['category_id', 'title'],
    properties: {
      category_id: { type: 'string' },
      title: { type: 'string' },
      photo_url: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      sort_order: { type: ['integer', 'null'] },
      is_active: { type: ['boolean', 'null'] }
    }
  }
};

const optionPostSchema = {
  body: {
    type: 'object',
    required: ['product_id', 'price'],
    properties: {
      product_id: { type: 'integer' },
      size: { type: ['string', 'null'] },
      price: { type: 'number' },
      sort_order: { type: ['integer', 'null'] },
      is_active: { type: ['boolean', 'null'] }
    }
  }
};

const optionPutSchema = {
  body: {
    type: 'object',
    required: ['price'],
    properties: {
      size: { type: ['string', 'null'] },
      price: { type: 'number' },
      sort_order: { type: ['integer', 'null'] },
      is_active: { type: ['boolean', 'null'] }
    }
  }
};

const eventPostPutSchema = {
  body: {
    type: 'object',
    required: ['event_datetime', 'title'],
    properties: {
      event_datetime: { type: 'string' },
      title: { type: 'string' },
      description: { type: ['string', 'null'] },
      is_active: { type: ['boolean', 'null'] }
    }
  }
};

const galleryPostPutSchema = {
  body: {
    type: 'object',
    required: ['photo_url'],
    properties: {
      photo_url: { type: 'string' },
      title: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      sort_order: { type: ['integer', 'null'] }
    }
  }
};

const reviewPostPutSchema = {
  body: {
    type: 'object',
    required: ['author', 'rating', 'text'],
    properties: {
      author: { type: 'string' },
      rating: { type: 'integer', minimum: 1, maximum: 5 },
      text: { type: 'string' },
      sort_order: { type: ['integer', 'null'] }
    }
  }
};

const reviewSummaryPutSchema = {
  body: {
    type: 'object',
    required: ['average_rating', 'total_count'],
    properties: {
      average_rating: { type: 'number' },
      total_count: { type: 'integer' },
      google_link_label: { type: ['string', 'null'] },
      google_link_url: { type: ['string', 'null'] }
    }
  }
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  }
};

// Auth middleware to verify JWT
const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Unauthorized: Missing or invalid token format' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized: Invalid token' });
  }
};

async function adminRoutes(fastify, options) {
  
  // 1. POST /api/v1/admin/login
  fastify.post('/login', { schema: loginSchema }, async (request, reply) => {
    const { username, password } = request.body || {};
    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password are required' });
    }
    
    try {
      const result = await db.query('SELECT * FROM admin_users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return reply.code(401).send({ error: 'Invalid username or password' });
      }
      
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return reply.code(401).send({ error: 'Invalid username or password' });
      }
      
      if (!process.env.JWT_SECRET) {
        return reply.code(500).send({ error: 'JWT_SECRET is not configured on server' });
      }
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return { token };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // Create a sub-router or route hook for all other endpoints to enforce auth
  fastify.register(async function (authorizedRoutes) {
    authorizedRoutes.addHook('preHandler', authMiddleware);

    // --- VENUE CRUD ---
    // GET /api/v1/admin/venue
    authorizedRoutes.get('/venue', async (request, reply) => {
      const v = await db.query('SELECT * FROM venue LIMIT 1');
      const hours = await db.query('SELECT * FROM venue_hours ORDER BY sort_order ASC');
      const social = await db.query('SELECT * FROM venue_social ORDER BY sort_order ASC');
      return {
        venue: v.rows[0] || null,
        hours: hours.rows,
        social: social.rows
      };
    });

    // PUT /api/v1/admin/venue
    authorizedRoutes.put('/venue', { schema: venuePutSchema }, async (request, reply) => {
      const { title, address, phone, phone_href, whatsapp, maps_embed, maps_link, lat, lng } = request.body || {};
      try {
        await db.query(
          `UPDATE venue SET title = $1, address = $2, phone = $3, phone_href = $4, 
           whatsapp = $5, maps_embed = $6, maps_link = $7, lat = $8, lng = $9, updated_at = NOW()`,
          [title, address, phone, phone_href, whatsapp, maps_embed, maps_link, lat, lng]
        );
        return { message: 'Venue updated successfully' };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Database error' });
      }
    });

    // POST /api/v1/admin/venue/hours
    authorizedRoutes.post('/venue/hours', { schema: hoursSchema }, async (request, reply) => {
      const { label, hours, sort_order } = request.body || {};
      const res = await db.query(
        'INSERT INTO venue_hours (label, hours, sort_order) VALUES ($1, $2, $3) RETURNING *',
        [label, hours, sort_order || 0]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/venue/hours/:id
    authorizedRoutes.put('/venue/hours/:id', { schema: hoursSchema }, async (request, reply) => {
      const { id } = request.params;
      const { label, hours, sort_order } = request.body || {};
      await db.query(
        'UPDATE venue_hours SET label = $1, hours = $2, sort_order = $3 WHERE id = $4',
        [label, hours, sort_order, id]
      );
      return { message: 'Hours updated' };
    });

    // DELETE /api/v1/admin/venue/hours/:id
    authorizedRoutes.delete('/venue/hours/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM venue_hours WHERE id = $1', [id]);
      return { message: 'Hours deleted' };
    });

    // POST /api/v1/admin/venue/social
    authorizedRoutes.post('/venue/social', { schema: socialSchema }, async (request, reply) => {
      const { title, url, sort_order } = request.body || {};
      const res = await db.query(
        'INSERT INTO venue_social (title, url, sort_order) VALUES ($1, $2, $3) RETURNING *',
        [title, url, sort_order || 0]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/venue/social/:id
    authorizedRoutes.put('/venue/social/:id', { schema: socialSchema }, async (request, reply) => {
      const { id } = request.params;
      const { title, url, sort_order } = request.body || {};
      await db.query(
        'UPDATE venue_social SET title = $1, url = $2, sort_order = $3 WHERE id = $4',
        [title, url, sort_order, id]
      );
      return { message: 'Social link updated' };
    });

    // DELETE /api/v1/admin/venue/social/:id
    authorizedRoutes.delete('/venue/social/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM venue_social WHERE id = $1', [id]);
      return { message: 'Social link deleted' };
    });

    // --- MENU CRUD ---
    // GET /api/v1/admin/menu
    authorizedRoutes.get('/menu', async (request, reply) => {
      const categories = await db.query('SELECT * FROM menu_categories ORDER BY sort_order ASC');
      const products = await db.query('SELECT * FROM menu_products ORDER BY sort_order ASC');
      const options = await db.query('SELECT * FROM menu_options ORDER BY sort_order ASC');
      return { categories: categories.rows, products: products.rows, options: options.rows };
    });

    // POST /api/v1/admin/menu/categories
    authorizedRoutes.post('/menu/categories', { schema: categoryPostSchema }, async (request, reply) => {
      const { id, title, kicker, photo_url, sort_order, is_active } = request.body || {};
      const active = is_active !== false;
      const res = await db.query(
        'INSERT INTO menu_categories (id, title, kicker, photo_url, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id, title, kicker, photo_url, sort_order || 0, active]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/menu/categories/:id
    authorizedRoutes.put('/menu/categories/:id', { schema: categoryPutSchema }, async (request, reply) => {
      const { id } = request.params;
      const { title, kicker, photo_url, sort_order, is_active } = request.body || {};
      await db.query(
        'UPDATE menu_categories SET title = $1, kicker = $2, photo_url = $3, sort_order = $4, is_active = $5 WHERE id = $6',
        [title, kicker, photo_url, sort_order, is_active, id]
      );
      return { message: 'Category updated' };
    });

    // DELETE /api/v1/admin/menu/categories/:id
    authorizedRoutes.delete('/menu/categories/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM menu_categories WHERE id = $1', [id]);
      return { message: 'Category deleted' };
    });

    // POST /api/v1/admin/menu/products
    authorizedRoutes.post('/menu/products', { schema: productPostPutSchema }, async (request, reply) => {
      const { category_id, title, photo_url, description, sort_order, is_active } = request.body || {};
      const active = is_active !== false;
      const res = await db.query(
        'INSERT INTO menu_products (category_id, title, photo_url, description, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [category_id, title, photo_url, description, sort_order || 0, active]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/menu/products/:id
    authorizedRoutes.put('/menu/products/:id', { schema: productPostPutSchema }, async (request, reply) => {
      const { id } = request.params;
      const { category_id, title, photo_url, description, sort_order, is_active } = request.body || {};
      await db.query(
        'UPDATE menu_products SET category_id = $1, title = $2, photo_url = $3, description = $4, sort_order = $5, is_active = $6 WHERE id = $7',
        [category_id, title, photo_url, description, sort_order, is_active, id]
      );
      return { message: 'Product updated' };
    });

    // DELETE /api/v1/admin/menu/products/:id
    authorizedRoutes.delete('/menu/products/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM menu_products WHERE id = $1', [id]);
      return { message: 'Product deleted' };
    });

    // POST /api/v1/admin/menu/options
    authorizedRoutes.post('/menu/options', { schema: optionPostSchema }, async (request, reply) => {
      const { product_id, size, price, sort_order, is_active } = request.body || {};
      const active = is_active !== false;
      const res = await db.query(
        'INSERT INTO menu_options (product_id, size, price, sort_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [product_id, size || '', price, sort_order || 0, active]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/menu/options/:id
    authorizedRoutes.put('/menu/options/:id', { schema: optionPutSchema }, async (request, reply) => {
      const { id } = request.params;
      const { size, price, sort_order, is_active } = request.body || {};
      await db.query(
        'UPDATE menu_options SET size = $1, price = $2, sort_order = $3, is_active = $4 WHERE id = $5',
        [size, price, sort_order, is_active, id]
      );
      return { message: 'Product option updated' };
    });

    // DELETE /api/v1/admin/menu/options/:id
    authorizedRoutes.delete('/menu/options/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM menu_options WHERE id = $1', [id]);
      return { message: 'Product option deleted' };
    });

    // --- EVENTS CRUD ---
    // GET /api/v1/admin/events
    authorizedRoutes.get('/events', async (request, reply) => {
      try {
        const res = await db.query('SELECT * FROM events ORDER BY event_datetime ASC');
        return res.rows.map(e => ({
          id: e.id,
          event_datetime: e.event_datetime,
          title: e.title,
          description: e.description || '',
          is_active: e.is_active
        }));
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Database error' });
      }
    });

    // POST /api/v1/admin/events
    authorizedRoutes.post('/events', { schema: eventPostPutSchema }, async (request, reply) => {
      const { event_datetime, title, description, is_active } = request.body || {};
      const active = is_active !== false;
      const res = await db.query(
        'INSERT INTO events (event_datetime, title, description, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
        [event_datetime, title, description, active]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/events/:id
    authorizedRoutes.put('/events/:id', { schema: eventPostPutSchema }, async (request, reply) => {
      const { id } = request.params;
      const { event_datetime, title, description, is_active } = request.body || {};
      await db.query(
        'UPDATE events SET event_datetime = $1, title = $2, description = $3, is_active = $4 WHERE id = $5',
        [event_datetime, title, description, is_active, id]
      );
      return { message: 'Event updated' };
    });

    // DELETE /api/v1/admin/events/:id
    authorizedRoutes.delete('/events/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM events WHERE id = $1', [id]);
      return { message: 'Event deleted' };
    });

    // --- GALLERY CRUD ---
    // GET /api/v1/admin/gallery
    authorizedRoutes.get('/gallery', async (request, reply) => {
      try {
        const res = await db.query('SELECT * FROM gallery_images ORDER BY sort_order ASC');
        return res.rows;
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Database error' });
      }
    });

    // POST /api/v1/admin/gallery
    authorizedRoutes.post('/gallery', { schema: galleryPostPutSchema }, async (request, reply) => {
      const { photo_url, title, description, sort_order } = request.body || {};
      const res = await db.query(
        'INSERT INTO gallery_images (photo_url, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [photo_url, title || null, description || null, sort_order || 0]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/gallery/:id
    authorizedRoutes.put('/gallery/:id', { schema: galleryPostPutSchema }, async (request, reply) => {
      const { id } = request.params;
      const { photo_url, title, description, sort_order } = request.body || {};
      await db.query(
        'UPDATE gallery_images SET photo_url = $1, title = $2, description = $3, sort_order = $4 WHERE id = $5',
        [photo_url, title, description, sort_order, id]
      );
      return { message: 'Gallery image updated' };
    });

    // DELETE /api/v1/admin/gallery/:id
    authorizedRoutes.delete('/gallery/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM gallery_images WHERE id = $1', [id]);
      return { message: 'Gallery image deleted' };
    });

    // --- REVIEWS CRUD ---
    // GET /api/v1/admin/reviews
    authorizedRoutes.get('/reviews', async (request, reply) => {
      try {
        const summaryResult = await db.query('SELECT * FROM reviews_summary LIMIT 1');
        const reviewsResult = await db.query('SELECT * FROM reviews ORDER BY sort_order ASC');
        
        let summary = {
          average_rating: 5.0,
          total_count: 0,
          google_link_label: 'Google Yorumlar',
          google_link_url: 'https://tinyurl.com/yktn4hy4'
        };
        
        if (summaryResult.rows.length > 0) {
          const s = summaryResult.rows[0];
          summary = {
            average_rating: parseFloat(s.average_rating),
            total_count: parseInt(s.total_count),
            google_link_label: s.google_link_label,
            google_link_url: s.google_link_url
          };
        }
        
        return {
          reviews: reviewsResult.rows.map(r => ({
            id: r.id,
            author: r.author,
            rating: r.rating,
            text: r.text,
            sort_order: r.sort_order,
            n: r.author,
            s: r.rating,
            t: r.text
          })),
          summary
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Database error' });
      }
    });

    // POST /api/v1/admin/reviews
    authorizedRoutes.post('/reviews', { schema: reviewPostPutSchema }, async (request, reply) => {
      const { author, rating, text, sort_order } = request.body || {};
      const res = await db.query(
        'INSERT INTO reviews (author, rating, text, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [author, rating, text, sort_order || 0]
      );
      return res.rows[0];
    });

    // PUT /api/v1/admin/reviews/:id
    authorizedRoutes.put('/reviews/:id', { schema: reviewPostPutSchema }, async (request, reply) => {
      const { id } = request.params;
      const { author, rating, text, sort_order } = request.body || {};
      await db.query(
        'UPDATE reviews SET author = $1, rating = $2, text = $3, sort_order = $4 WHERE id = $5',
        [author, rating, text, sort_order, id]
      );
      return { message: 'Review updated' };
    });

    // DELETE /api/v1/admin/reviews/:id
    authorizedRoutes.delete('/reviews/:id', async (request, reply) => {
      const { id } = request.params;
      await db.query('DELETE FROM reviews WHERE id = $1', [id]);
      return { message: 'Review deleted' };
    });

    // PUT /api/v1/admin/reviews/summary
    authorizedRoutes.put('/reviews/summary', { schema: reviewSummaryPutSchema }, async (request, reply) => {
      const { average_rating, total_count, google_link_label, google_link_url } = request.body || {};
      await db.query(
        `UPDATE reviews_summary 
         SET average_rating = $1, total_count = $2, google_link_label = $3, google_link_url = $4, updated_at = NOW()`,
        [average_rating, total_count, google_link_label, google_link_url]
      );
      return { message: 'Review summary updated' };
    });

    // --- UPLOAD IMAGES ---
    // POST /api/v1/admin/upload
    authorizedRoutes.post('/upload', async (request, reply) => {
      try {
        const fileData = await request.file();
        if (!fileData) {
          return reply.code(400).send({ error: 'No file uploaded' });
        }
        
        const fileExt = path.extname(fileData.filename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        if (!allowedExtensions.includes(fileExt)) {
          return reply.code(400).send({ error: 'Invalid file format. Allowed: JPG, PNG, WEBP, GIF' });
        }
        
        const newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const uploadDir = path.join(__dirname, '../../uploads');
        
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const saveToPath = path.join(uploadDir, newFilename);
        await pump(fileData.file, fs.createWriteStream(saveToPath));
        
        // Construct the full URL
        const host = process.env.API_HOST || 'http://localhost:3001';
        const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
        const fileUrl = `${cleanHost}/uploads/${newFilename}`;
        
        return { url: fileUrl };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'File upload failed' });
      }
    });

  });
}

module.exports = adminRoutes;
