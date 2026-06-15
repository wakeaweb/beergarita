const db = require('../db/db');

// Helper to format photo URLs
const formatPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const host = process.env.API_HOST || 'http://localhost:3001';
  const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  return `${cleanHost}${cleanUrl}`;
};

// Date Formatter Helper for Turkish Short Names
const formatEventDate = (datetimeStr) => {
  const dt = new Date(datetimeStr);
  
  const dayNames = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  
  const dayName = dayNames[dt.getDay()];
  const dayOfMonth = dt.getDate();
  const monthName = monthNames[dt.getMonth()];
  
  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  
  return {
    day: dayName,
    date: `${dayOfMonth} ${monthName}`,
    time: `${hours}:${minutes}`
  };
};

async function publicRoutes(fastify, options) {
  // 1. GET /api/v1/venue
  fastify.get('/venue', async (request, reply) => {
    try {
      const venueResult = await db.query('SELECT * FROM venue LIMIT 1');
      if (venueResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Venue not found' });
      }
      
      const hoursResult = await db.query('SELECT * FROM venue_hours ORDER BY sort_order ASC');
      const socialResult = await db.query('SELECT * FROM venue_social ORDER BY sort_order ASC');
      
      const v = venueResult.rows[0];
      return {
        title: v.title,
        address: v.address,
        phone: v.phone,
        phone_href: v.phone_href,
        whatsapp: v.whatsapp,
        maps_embed: v.maps_embed,
        maps_link: v.maps_link,
        lat: v.lat ? parseFloat(v.lat) : null,
        lng: v.lng ? parseFloat(v.lng) : null,
        hours: hoursResult.rows.map(h => ({
          d: h.label,
          h: h.hours
        })),
        social: socialResult.rows.map(s => ({
          label: s.title,
          handle: s.url, // URL as handle
          href: s.url
        }))
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // 2. GET /api/v1/menu
  fastify.get('/menu', async (request, reply) => {
    try {
      const categoriesResult = await db.query(
        'SELECT * FROM menu_categories WHERE is_active = true ORDER BY sort_order ASC'
      );
      const productsResult = await db.query(
        'SELECT * FROM menu_products WHERE is_active = true ORDER BY sort_order ASC'
      );
      const optionsResult = await db.query(
        'SELECT * FROM menu_options WHERE is_active = true ORDER BY sort_order ASC'
      );
      
      const categories = categoriesResult.rows;
      const products = productsResult.rows;
      const options = optionsResult.rows;
      
      // Structure the response
      const menu = categories.map(cat => {
        const catProducts = products.filter(p => p.category_id === cat.id);
        
        const items = catProducts.map(prod => {
          const prodOptions = options.filter(opt => opt.product_id === prod.id);
          
          // Formatted price string helper
          let priceStr = '';
          if (prodOptions.length > 0) {
            const primaryOpt = prodOptions[0];
            const priceVal = Math.round(parseFloat(primaryOpt.price));
            if (primaryOpt.size) {
              priceStr = `₺${priceVal} / ${primaryOpt.size.toLowerCase()}`;
            } else {
              priceStr = `₺${priceVal}`;
            }
          }
          
          return {
            n: prod.title,
            d: prod.description || '',
            p: priceStr,
            popupImg: prod.photo_url ? formatPhotoUrl(prod.photo_url) : undefined,
            // Expose the raw options if the frontend needs to render them detailed
            options: prodOptions.map(opt => ({
              size: opt.size,
              price: parseFloat(opt.price)
            }))
          };
        });
        
        return {
          id: cat.id,
          name: cat.title,
          kicker: cat.kicker || '',
          img: formatPhotoUrl(cat.photo_url),
          items
        };
      });
      
      return menu;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // 3. GET /api/v1/events
  fastify.get('/events', async (request, reply) => {
    try {
      // Show events for today and future days
      const result = await db.query(
        `SELECT * FROM events 
         WHERE is_active = true AND event_datetime::date >= CURRENT_DATE 
         ORDER BY event_datetime ASC`
      );
      
      return result.rows.map(e => {
        const formatted = formatEventDate(e.event_datetime);
        return {
          day: formatted.day,
          date: formatted.date,
          time: formatted.time,
          title: e.title,
          desc: e.description || ''
        };
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // 4. GET /api/v1/gallery
  fastify.get('/gallery', async (request, reply) => {
    try {
      const result = await db.query(
        'SELECT * FROM gallery_images ORDER BY sort_order ASC'
      );
      return result.rows.map(img => formatPhotoUrl(img.photo_url));
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });

  // 5. GET /api/v1/reviews
  fastify.get('/reviews', async (request, reply) => {
    try {
      const summaryResult = await db.query('SELECT * FROM reviews_summary LIMIT 1');
      const reviewsResult = await db.query('SELECT * FROM reviews ORDER BY sort_order ASC');
      
      if (summaryResult.rows.length === 0) {
        return {
          average: 5.0,
          count: 0,
          google_link_label: 'Google Yorumlar',
          google_link_url: 'https://tinyurl.com/yktn4hy4',
          reviews: []
        };
      }
      
      const s = summaryResult.rows[0];
      return {
        average: parseFloat(s.average_rating),
        count: parseInt(s.total_count),
        google_link_label: s.google_link_label,
        google_link_url: s.google_link_url,
        reviews: reviewsResult.rows.map(r => ({
          n: r.author,
          s: r.rating,
          t: r.text
        }))
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Database error' });
    }
  });
}

module.exports = publicRoutes;
