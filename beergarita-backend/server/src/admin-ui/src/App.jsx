import React, { useState, useEffect } from 'react';
import { 
  Store, Utensils, Calendar, Image as ImageIcon, MessageSquare, 
  LogOut, Plus, Trash2, Edit2, Check, X, Upload, Save, Lock, User
} from 'lucide-react';
import './App.css';

const API_BASE = '/api/v1';

function App() {
  const [token, setToken] = useState(localStorage.getItem('beergarita_admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('venue');
  const [notification, setNotification] = useState({ text: '', type: '' });

  // Data States
  const [venueData, setVenueData] = useState({ venue: {}, hours: [], social: [] });
  const [menuData, setMenuData] = useState({ categories: [], products: [], options: [] });
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: {} });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Editing/Creating Modals/States
  const [editingItem, setEditingItem] = useState(null); // { type: 'category|product|option|event|review', data: {} }
  const [isAdding, setIsAdding] = useState(false); // trigger form display

  // Social/Hour form states
  const [newHour, setNewHour] = useState({ label: '', hours: '', sort_order: 0 });
  const [newSocial, setNewSocial] = useState({ title: '', url: '', sort_order: 0 });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı');
      }
      localStorage.setItem('beergarita_admin_token', data.token);
      setToken(data.token);
      showNotification('Başarıyla giriş yapıldı!');
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('beergarita_admin_token');
    setToken('');
    showNotification('Çıkış yapıldı.');
  };

  const authHeader = () => ({
    'Authorization': `Bearer ${token}`
  });

  const fetchData = async () => {
    try {
      if (activeTab === 'venue') {
        const res = await fetch(`${API_BASE}/admin/venue`, { headers: authHeader() });
        if (res.status === 401) return handleLogout();
        const data = await res.json();
        setVenueData(data);
      } else if (activeTab === 'menu') {
        const res = await fetch(`${API_BASE}/admin/menu`, { headers: authHeader() });
        if (res.status === 401) return handleLogout();
        const data = await res.json();
        setMenuData(data);
        if (data.categories.length > 0 && !selectedCategory) {
          setSelectedCategory(data.categories[0].id);
        }
      } else if (activeTab === 'events') {
        const res = await fetch(`${API_BASE}/admin/events`, { headers: authHeader() });
        if (res.status === 401) return handleLogout();
        const data = await res.json();
        const formattedEvents = data.map(e => {
          const dt = new Date(e.event_datetime);
          const dayNames = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
          const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
          return {
            id: e.id,
            day: dayNames[dt.getDay()],
            date: `${dt.getDate()} ${monthNames[dt.getMonth()]}`,
            time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
            event_datetime: e.event_datetime,
            title: e.title,
            desc: e.description,
            is_active: e.is_active
          };
        });
        setEvents(formattedEvents);
      } else if (activeTab === 'gallery') {
        const res = await fetch(`${API_BASE}/admin/gallery`, { headers: authHeader() });
        if (res.status === 401) return handleLogout();
        const data = await res.json();
        setGallery(data);
      } else if (activeTab === 'reviews') {
        const res = await fetch(`${API_BASE}/admin/reviews`, { headers: authHeader() });
        if (res.status === 401) return handleLogout();
        const data = await res.json();
        setReviewsData({
          reviews: data.reviews,
          summary: {
            average_rating: data.summary.average_rating,
            total_count: data.summary.total_count,
            google_link_label: data.summary.google_link_label,
            google_link_url: data.summary.google_link_url
          }
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (file, onUploaded) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: authHeader(),
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yükleme başarısız');
      onUploaded(data.url);
      showNotification('Görsel başarıyla yüklendi!');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- CRUD ACTIONS ---

  // Update Venue Info
  const saveVenueInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/venue`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(venueData.venue)
      });
      if (res.ok) {
        showNotification('Mekân bilgileri güncellendi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Güncelleme sırasında hata oluştu.', 'error');
    }
  };

  // Add Hours
  const addHours = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/venue/hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(newHour)
      });
      if (res.ok) {
        showNotification('Saat eklendi.');
        setNewHour({ label: '', hours: '', sort_order: 0 });
        fetchData();
      }
    } catch (err) {
      showNotification('Ekleme başarısız.', 'error');
    }
  };

  // Delete Hours
  const deleteHours = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/venue/hours/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Saat silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Add Social
  const addSocial = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/venue/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(newSocial)
      });
      if (res.ok) {
        showNotification('Sosyal medya linki eklendi.');
        setNewSocial({ title: '', url: '', sort_order: 0 });
        fetchData();
      }
    } catch (err) {
      showNotification('Ekleme başarısız.', 'error');
    }
  };

  // Delete Social
  const deleteSocial = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/venue/social/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Sosyal medya linki silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Save Category
  const saveCategory = async (cat) => {
    const isNew = !menuData.categories.find(c => c.id === cat.id);
    const url = isNew ? `${API_BASE}/admin/menu/categories` : `${API_BASE}/admin/menu/categories/${cat.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        showNotification('Kategori kaydedildi.');
        setEditingItem(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (err) {
      showNotification('Hata oluştu.', 'error');
    }
  };

  // Delete Category
  const deleteCategory = async (id) => {
    if (!confirm('Kategoriyi ve içindeki tüm ürünleri silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/menu/categories/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Kategori silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Save Product
  const saveProduct = async (prod) => {
    const isNew = !prod.id;
    const url = isNew ? `${API_BASE}/admin/menu/products` : `${API_BASE}/admin/menu/products/${prod.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(prod)
      });
      if (res.ok) {
        showNotification('Ürün kaydedildi.');
        setEditingItem(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (err) {
      showNotification('Hata oluştu.', 'error');
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!confirm('Ürünü silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/menu/products/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Ürün silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Save Option
  const saveOption = async (opt) => {
    const isNew = !opt.id;
    const url = isNew ? `${API_BASE}/admin/menu/options` : `${API_BASE}/admin/menu/options/${opt.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(opt)
      });
      if (res.ok) {
        showNotification('Fiyat seçeneği kaydedildi.');
        setEditingItem(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (err) {
      showNotification('Hata oluştu.', 'error');
    }
  };

  // Delete Option
  const deleteOption = async (id) => {
    if (!confirm('Fiyat seçeneğini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/menu/options/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Fiyat silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Save Event
  const saveEvent = async (e) => {
    const isNew = !e.id;
    const url = isNew ? `${API_BASE}/admin/events` : `${API_BASE}/admin/events/${e.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(e)
      });
      if (res.ok) {
        showNotification('Etkinlik kaydedildi.');
        setEditingItem(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (err) {
      showNotification('Hata oluştu.', 'error');
    }
  };

  // Delete Event
  const deleteEvent = async (id) => {
    if (!confirm('Etkinliği silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/events/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Etkinlik silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Add Gallery Image
  const addGalleryImage = async (img) => {
    try {
      const res = await fetch(`${API_BASE}/admin/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(img)
      });
      if (res.ok) {
        showNotification('Galeri görseli eklendi.');
        setEditingItem(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (err) {
      showNotification('Hata oluştu.', 'error');
    }
  };

  // Delete Gallery Image
  const deleteGalleryImage = async (id) => {
    if (!confirm('Galeri görselini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Galeri görseli silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };

  // Save Reviews Summary
  const saveReviewsSummary = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/reviews/summary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(reviewsData.summary)
      });
      if (res.ok) {
        showNotification('Yorum özeti güncellendi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Güncelleme başarısız.', 'error');
    }
  };

  // Save Review
  const saveReview = async (rev) => {
    const isNew = !rev.id;
    const url = isNew ? `${API_BASE}/admin/reviews` : `${API_BASE}/admin/reviews/${rev.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(rev)
      });
      if (res.ok) {
        showNotification('Yorum kaydedildi.');
        setEditingItem(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (err) {
      showNotification('Hata oluştu.', 'error');
    }
  };

  // Delete Review
  const deleteReview = async (id) => {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        showNotification('Yorum silindi.');
        fetchData();
      }
    } catch (err) {
      showNotification('Silme başarısız.', 'error');
    }
  };


  if (!token) {
    return (
      <div className="login-container">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="logo-area">
            <h1 className="pub-title">THE BEERGARITA PUB</h1>
            <p className="pub-subtitle">Yönetim Paneli Girişi</p>
          </div>
          
          {loginError && <div className="error-alert">{loginError}</div>}
          
          <div className="input-group">
            <label><User size={16} /> Kullanıcı Adı</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Kullanıcı adınızı girin"
              required 
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> Şifre</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Şifrenizi girin"
              required 
            />
          </div>

          <button type="submit" className="btn-primary">Giriş Yap</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Notifications */}
      {notification.text && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.text}
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>Beergarita Pub</h2>
          <span>Yönetim</span>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={activeTab === 'venue' ? 'active' : ''} 
            onClick={() => { setActiveTab('venue'); setEditingItem(null); }}
          >
            <Store size={18} /> Mekân Bilgileri
          </button>
          
          <button 
            className={activeTab === 'menu' ? 'active' : ''} 
            onClick={() => { setActiveTab('menu'); setEditingItem(null); }}
          >
            <Utensils size={18} /> Menü Yönetimi
          </button>

          <button 
            className={activeTab === 'events' ? 'active' : ''} 
            onClick={() => { setActiveTab('events'); setEditingItem(null); }}
          >
            <Calendar size={18} /> Etkinlikler
          </button>

          <button 
            className={activeTab === 'gallery' ? 'active' : ''} 
            onClick={() => { setActiveTab('gallery'); setEditingItem(null); }}
          >
            <ImageIcon size={18} /> Galeri
          </button>

          <button 
            className={activeTab === 'reviews' ? 'active' : ''} 
            onClick={() => { setActiveTab('reviews'); setEditingItem(null); }}
          >
            <MessageSquare size={18} /> Yorumlar
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* TAB 1: VENUE */}
        {activeTab === 'venue' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Mekân Bilgileri ve Ayarlar</h2>
            </div>
            
            <div className="grid-two-cols">
              <form onSubmit={saveVenueInfo} className="card-glass">
                <h3>Genel Bilgiler</h3>
                
                <div className="form-group">
                  <label>Mekân Başlığı</label>
                  <input 
                    type="text" 
                    value={venueData.venue?.title || ''} 
                    onChange={e => setVenueData({
                      ...venueData,
                      venue: { ...venueData.venue, title: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Adres</label>
                  <textarea 
                    rows="3"
                    value={venueData.venue?.address || ''} 
                    onChange={e => setVenueData({
                      ...venueData,
                      venue: { ...venueData.venue, address: e.target.value }
                    })}
                  />
                </div>

                <div className="grid-two-cols">
                  <div className="form-group">
                    <label>Telefon</label>
                    <input 
                      type="text" 
                      value={venueData.venue?.phone || ''} 
                      onChange={e => setVenueData({
                        ...venueData,
                        venue: { ...venueData.venue, phone: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefon Linki (tel:)</label>
                    <input 
                      type="text" 
                      value={venueData.venue?.phone_href || ''} 
                      onChange={e => setVenueData({
                        ...venueData,
                        venue: { ...venueData.venue, phone_href: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>WhatsApp (wa.me/)</label>
                  <input 
                    type="text" 
                    value={venueData.venue?.whatsapp || ''} 
                    onChange={e => setVenueData({
                      ...venueData,
                      venue: { ...venueData.venue, whatsapp: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Google Maps Embed Linki</label>
                  <input 
                    type="text" 
                    value={venueData.venue?.maps_embed || ''} 
                    onChange={e => setVenueData({
                      ...venueData,
                      venue: { ...venueData.venue, maps_embed: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Google Maps Paylaşım Linki</label>
                  <input 
                    type="text" 
                    value={venueData.venue?.maps_link || ''} 
                    onChange={e => setVenueData({
                      ...venueData,
                      venue: { ...venueData.venue, maps_link: e.target.value }
                    })}
                  />
                </div>

                <button type="submit" className="btn-primary"><Save size={16} /> Kaydet</button>
              </form>

              <div className="flex-column gap-20">
                {/* Working Hours */}
                <div className="card-glass">
                  <h3>Çalışma Saatleri</h3>
                  <div className="items-list">
                    {venueData.hours.map(h => (
                      <div key={h.id} className="list-item">
                        <div>
                          <strong>{h.label}:</strong> {h.hours}
                        </div>
                        <button onClick={() => deleteHours(h.id)} className="btn-icon-danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={addHours} className="form-inline mt-20">
                    <input 
                      type="text" 
                      placeholder="Günler (örn. Pazar)" 
                      value={newHour.label}
                      onChange={e => setNewHour({ ...newHour, label: e.target.value })}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Saatler (örn. 12:00 – 02:00)" 
                      value={newHour.hours}
                      onChange={e => setNewHour({ ...newHour, hours: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn-secondary"><Plus size={16} /></button>
                  </form>
                </div>

                {/* Social Media */}
                <div className="card-glass">
                  <h3>Sosyal Medya Linkleri</h3>
                  <div className="items-list">
                    {venueData.social.map(s => (
                      <div key={s.id} className="list-item">
                        <div>
                          <strong>{s.title}:</strong> {s.url}
                        </div>
                        <button onClick={() => deleteSocial(s.id)} className="btn-icon-danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={addSocial} className="form-inline mt-20">
                    <input 
                      type="text" 
                      placeholder="Platform (örn. Instagram)" 
                      value={newSocial.title}
                      onChange={e => setNewSocial({ ...newSocial, title: e.target.value })}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="URL (örn. https://instagram.com/...)" 
                      value={newSocial.url}
                      onChange={e => setNewSocial({ ...newSocial, url: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn-secondary"><Plus size={16} /></button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENU */}
        {activeTab === 'menu' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Menü Kategorileri, Ürünler ve Fiyat Seçenekleri</h2>
            </div>

            <div className="menu-admin-wrapper">
              {/* Category selector / Column */}
              <div className="menu-column-cat">
                <div className="column-header">
                  <h3>Kategoriler</h3>
                  <button onClick={() => {
                    setEditingItem({ type: 'category', data: { id: '', title: '', kicker: '', photo_url: '', sort_order: 0, is_active: true } });
                    setIsAdding(true);
                  }} className="btn-inline-add"><Plus size={14} /> Ekle</button>
                </div>

                <div className="category-vertical-list">
                  {menuData.categories.map(cat => (
                    <div 
                      key={cat.id} 
                      className={`category-item-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <div className="cat-info">
                        <strong>{cat.title}</strong>
                        <span>{cat.id}</span>
                      </div>
                      <div className="actions">
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ type: 'category', data: cat });
                          setIsAdding(false);
                        }} className="btn-icon">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat.id);
                        }} className="btn-icon-danger">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products column */}
              <div className="menu-column-prod">
                <div className="column-header">
                  <h3>Ürünler ({menuData.products.filter(p => p.category_id === selectedCategory).length})</h3>
                  {selectedCategory && (
                    <button onClick={() => {
                      setEditingItem({ 
                        type: 'product', 
                        data: { category_id: selectedCategory, title: '', description: '', photo_url: '', sort_order: 0, is_active: true } 
                      });
                      setIsAdding(true);
                    }} className="btn-inline-add"><Plus size={14} /> Ekle</button>
                  )}
                </div>

                <div className="product-vertical-list">
                  {menuData.products
                    .filter(p => p.category_id === selectedCategory)
                    .map(prod => (
                      <div 
                        key={prod.id} 
                        className={`product-item-card ${selectedProduct === prod.id ? 'selected' : ''}`}
                        onClick={() => setSelectedProduct(prod.id)}
                      >
                        <div className="prod-meta">
                          {prod.photo_url && <img src={prod.photo_url} alt="" className="prod-thumbnail" />}
                          <div className="prod-info">
                            <strong>{prod.title}</strong>
                            <p>{prod.description ? (prod.description.substring(0, 45) + '...') : ''}</p>
                          </div>
                        </div>
                        <div className="actions">
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({ type: 'product', data: prod });
                            setIsAdding(false);
                          }} className="btn-icon">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            deleteProduct(prod.id);
                          }} className="btn-icon-danger">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Options/Prices column */}
              <div className="menu-column-opts">
                <div className="column-header">
                  <h3>Fiyat Seçenekleri ({menuData.options.filter(o => o.product_id === selectedProduct).length})</h3>
                  {selectedProduct && (
                    <button onClick={() => {
                      setEditingItem({ 
                        type: 'option', 
                        data: { product_id: selectedProduct, size: '', price: 0, sort_order: 0, is_active: true } 
                      });
                      setIsAdding(true);
                    }} className="btn-inline-add"><Plus size={14} /> Ekle</button>
                  )}
                </div>

                <div className="options-vertical-list">
                  {menuData.options
                    .filter(o => o.product_id === selectedProduct)
                    .map(opt => (
                      <div key={opt.id} className="option-item-card">
                        <div className="opt-info">
                          <strong>{opt.size || 'Varsayılan Porsiyon'}</strong>
                          <span>₺{opt.price}</span>
                        </div>
                        <div className="actions">
                          <button onClick={() => {
                            setEditingItem({ type: 'option', data: opt });
                            setIsAdding(false);
                          }} className="btn-icon">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => deleteOption(opt.id)} className="btn-icon-danger">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal / Editor Side Panel */}
            {editingItem && (
              <div className="editor-overlay">
                <div className="editor-panel">
                  <div className="panel-header">
                    <h3>{isAdding ? 'Yeni Ekle' : 'Düzenle'}: {editingItem.type.toUpperCase()}</h3>
                    <button onClick={() => setEditingItem(null)} className="btn-close"><X size={16} /></button>
                  </div>
                  
                  <div className="panel-body">
                    {/* Category Form */}
                    {editingItem.type === 'category' && (
                      <CategoryForm 
                        data={editingItem.data} 
                        onSave={saveCategory} 
                        handleImageUpload={handleImageUpload}
                      />
                    )}

                    {/* Product Form */}
                    {editingItem.type === 'product' && (
                      <ProductForm 
                        data={editingItem.data} 
                        onSave={saveProduct} 
                        handleImageUpload={handleImageUpload}
                      />
                    )}

                    {/* Option Form */}
                    {editingItem.type === 'option' && (
                      <OptionForm 
                        data={editingItem.data} 
                        onSave={saveOption} 
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: EVENTS */}
        {activeTab === 'events' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Etkinlik Yönetimi</h2>
              <button onClick={() => {
                setEditingItem({ 
                  type: 'event', 
                  data: { event_datetime: '', title: '', description: '', is_active: true } 
                });
                setIsAdding(true);
              }} className="btn-primary"><Plus size={16} /> Yeni Etkinlik Ekle</button>
            </div>

            <div className="card-glass">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Durum</th>
                    <th>Tarih & Saat</th>
                    <th>Başlık</th>
                    <th>Açıklama</th>
                    <th style={{ width: '100px' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id || ev.title}>
                      <td>
                        <span className={`status-badge ${ev.is_active !== false ? 'active' : 'inactive'}`}>
                          {ev.is_active !== false ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td><strong>{ev.date} - {ev.time}</strong> ({ev.day})</td>
                      <td>{ev.title}</td>
                      <td>{ev.desc}</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => {
                            setEditingItem({ type: 'event', data: ev });
                            setIsAdding(false);
                          }} className="btn-icon"><Edit2 size={14} /></button>
                          <button onClick={() => deleteEvent(ev.id)} className="btn-icon-danger"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingItem && editingItem.type === 'event' && (
              <div className="editor-overlay">
                <div className="editor-panel">
                  <div className="panel-header">
                    <h3>{isAdding ? 'Yeni Etkinlik' : 'Etkinlik Düzenle'}</h3>
                    <button onClick={() => setEditingItem(null)} className="btn-close"><X size={16} /></button>
                  </div>
                  <div className="panel-body">
                    <EventForm data={editingItem.data} onSave={saveEvent} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Galeri Yönetimi</h2>
              <button onClick={() => {
                setEditingItem({ 
                  type: 'gallery', 
                  data: { photo_url: '', title: '', description: '', sort_order: 0 } 
                });
                setIsAdding(true);
              }} className="btn-primary"><Plus size={16} /> Yeni Görsel Ekle</button>
            </div>

            <div className="gallery-admin-grid">
              {gallery.map(img => (
                <div key={img.id} className="gallery-admin-card">
                  <img src={img.photo_url} alt="" className="gallery-admin-img" />
                  <div className="gallery-card-actions">
                    <button onClick={() => deleteGalleryImage(img.id)} className="btn-danger-full">
                      <Trash2 size={14} /> Görseli Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingItem && editingItem.type === 'gallery' && (
              <div className="editor-overlay">
                <div className="editor-panel">
                  <div className="panel-header">
                    <h3>Yeni Görsel Ekle</h3>
                    <button onClick={() => setEditingItem(null)} className="btn-close"><X size={16} /></button>
                  </div>
                  <div className="panel-body">
                    <GalleryForm 
                      data={editingItem.data} 
                      onSave={addGalleryImage} 
                      handleImageUpload={handleImageUpload} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Yorum Yönetimi</h2>
            </div>

            <div className="grid-two-cols">
              {/* Google Maps Summary Settings */}
              <div className="card-glass">
                <h3>Google Yorum Özeti (Manuel Ayarlar)</h3>
                <form onSubmit={saveReviewsSummary} className="mt-20">
                  <div className="form-group">
                    <label>Ortalama Puan (Maps Skoru)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="1" 
                      max="5"
                      value={reviewsData.summary.average_rating || 4.8} 
                      onChange={e => setReviewsData({
                        ...reviewsData,
                        summary: { ...reviewsData.summary, average_rating: e.target.value }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Toplam Yorum Sayısı</label>
                    <input 
                      type="number"
                      value={reviewsData.summary.total_count || 100} 
                      onChange={e => setReviewsData({
                        ...reviewsData,
                        summary: { ...reviewsData.summary, total_count: e.target.value }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Google Linki Buton Metni</label>
                    <input 
                      type="text"
                      value={reviewsData.summary.google_link_label || 'Google Yorumlar'} 
                      onChange={e => setReviewsData({
                        ...reviewsData,
                        summary: { ...reviewsData.summary, google_link_label: e.target.value }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Google Maps Yorum Linki (URL)</label>
                    <input 
                      type="text"
                      value={reviewsData.summary.google_link_url || ''} 
                      onChange={e => setReviewsData({
                        ...reviewsData,
                        summary: { ...reviewsData.summary, google_link_url: e.target.value }
                      })}
                    />
                  </div>

                  <button type="submit" className="btn-primary"><Save size={16} /> Özeti Kaydet</button>
                </form>
              </div>

              {/* Individual reviews list */}
              <div className="flex-column gap-20">
                <div className="card-glass">
                  <div className="flex-row justify-between align-center mb-20">
                    <h3>Öne Çıkarılan Yorumlar</h3>
                    <button onClick={() => {
                      setEditingItem({ 
                        type: 'review', 
                        data: { author: '', rating: 5, text: '', sort_order: 0 } 
                      });
                      setIsAdding(true);
                    }} className="btn-inline-add"><Plus size={14} /> Ekle</button>
                  </div>

                  <div className="items-list">
                    {reviewsData.reviews.map(rev => (
                      <div key={rev.id || rev.n} className="list-item">
                        <div className="review-meta-item">
                          <strong>{rev.n}</strong> ({rev.s} Yıldız)
                          <p>{rev.t}</p>
                        </div>
                        <div className="actions">
                          <button onClick={() => {
                            setEditingItem({ type: 'review', data: rev });
                            setIsAdding(false);
                          }} className="btn-icon"><Edit2 size={12} /></button>
                          <button onClick={() => deleteReview(rev.id)} className="btn-icon-danger"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {editingItem && editingItem.type === 'review' && (
              <div className="editor-overlay">
                <div className="editor-panel">
                  <div className="panel-header">
                    <h3>{isAdding ? 'Yeni Yorum Ekle' : 'Yorum Düzenle'}</h3>
                    <button onClick={() => setEditingItem(null)} className="btn-close"><X size={16} /></button>
                  </div>
                  <div className="panel-body">
                    <ReviewForm data={editingItem.data} onSave={saveReview} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB FORM COMPONENTS ---

function CategoryForm({ data, onSave, handleImageUpload }) {
  const [form, setForm] = useState({ ...data });

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={onSubmit} className="flex-column gap-15">
      <div className="form-group">
        <label>Kategori ID (Slug, örn. ficibira)</label>
        <input 
          type="text" 
          value={form.id} 
          onChange={e => setForm({ ...form, id: e.target.value.toLowerCase() })}
          required
        />
      </div>

      <div className="form-group">
        <label>Başlık</label>
        <input 
          type="text" 
          value={form.title} 
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Kicker / Alt Başlık</label>
        <input 
          type="text" 
          value={form.kicker || ''} 
          onChange={e => setForm({ ...form, kicker: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Görsel Seç / Yükle</label>
        <input 
          type="file" 
          onChange={e => handleImageUpload(e.target.files[0], (url) => setForm({ ...form, photo_url: url }))}
        />
        {form.photo_url && (
          <div className="image-preview-wrapper mt-10">
            <img src={form.photo_url} alt="" className="form-image-preview" />
            <input 
              type="text" 
              value={form.photo_url} 
              onChange={e => setForm({ ...form, photo_url: e.target.value })}
              className="mt-5 text-sm"
              placeholder="Görsel URL'si"
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Sıralama Değeri (Sort Order)</label>
        <input 
          type="number" 
          value={form.sort_order} 
          onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
      </div>

      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="is_active_cat"
          checked={form.is_active !== false} 
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
        <label htmlFor="is_active_cat">Aktif (Menüde Göster)</label>
      </div>

      <button type="submit" className="btn-primary mt-10">Kaydet</button>
    </form>
  );
}

function ProductForm({ data, onSave, handleImageUpload }) {
  const [form, setForm] = useState({ ...data });

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={onSubmit} className="flex-column gap-15">
      <div className="form-group">
        <label>Ürün Adı</label>
        <input 
          type="text" 
          value={form.title} 
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Açıklama</label>
        <textarea 
          rows="3"
          value={form.description || ''} 
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Görsel Seç / Yükle</label>
        <input 
          type="file" 
          onChange={e => handleImageUpload(e.target.files[0], (url) => setForm({ ...form, photo_url: url }))}
        />
        {form.photo_url && (
          <div className="image-preview-wrapper mt-10">
            <img src={form.photo_url} alt="" className="form-image-preview" />
            <input 
              type="text" 
              value={form.photo_url} 
              onChange={e => setForm({ ...form, photo_url: e.target.value })}
              className="mt-5 text-sm"
              placeholder="Görsel URL'si"
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Sıralama Değeri</label>
        <input 
          type="number" 
          value={form.sort_order} 
          onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
      </div>

      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="is_active_prod"
          checked={form.is_active !== false} 
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
        <label htmlFor="is_active_prod">Aktif (Listede Göster)</label>
      </div>

      <button type="submit" className="btn-primary mt-10">Kaydet</button>
    </form>
  );
}

function OptionForm({ data, onSave }) {
  const [form, setForm] = useState({ ...data });

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={onSubmit} className="flex-column gap-15">
      <div className="form-group">
        <label>Porsiyon / Boyut (örn. Şişe, Duble veya varsayılan için boş bırakın)</label>
        <input 
          type="text" 
          value={form.size} 
          onChange={e => setForm({ ...form, size: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Fiyat (TL)</label>
        <input 
          type="number" 
          step="0.01"
          value={form.price} 
          onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div className="form-group">
        <label>Sıralama Değeri</label>
        <input 
          type="number" 
          value={form.sort_order} 
          onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
      </div>

      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="is_active_opt"
          checked={form.is_active !== false} 
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
        <label htmlFor="is_active_opt">Aktif</label>
      </div>

      <button type="submit" className="btn-primary mt-10">Kaydet</button>
    </form>
  );
}

function EventForm({ data, onSave }) {
  const [form, setForm] = useState({ ...data });

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={onSubmit} className="flex-column gap-15">
      <div className="form-group">
        <label>Etkinlik Tarihi & Saati</label>
        <input 
          type="datetime-local" 
          value={form.event_datetime ? form.event_datetime.substring(0, 16) : ''} 
          onChange={e => setForm({ ...form, event_datetime: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Etkinlik Başlığı</label>
        <input 
          type="text" 
          value={form.title} 
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Açıklama</label>
        <textarea 
          rows="3"
          value={form.description || ''} 
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="is_active_event"
          checked={form.is_active !== false} 
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
        <label htmlFor="is_active_event">Aktif</label>
      </div>

      <button type="submit" className="btn-primary mt-10">Kaydet</button>
    </form>
  );
}

function GalleryForm({ data, onSave, handleImageUpload }) {
  const [form, setForm] = useState({ ...data });

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={onSubmit} className="flex-column gap-15">
      <div className="form-group">
        <label>Görsel Seç / Yükle</label>
        <input 
          type="file" 
          onChange={e => handleImageUpload(e.target.files[0], (url) => setForm({ ...form, photo_url: url }))}
          required={!form.photo_url}
        />
        {form.photo_url && (
          <div className="image-preview-wrapper mt-10">
            <img src={form.photo_url} alt="" className="form-image-preview" />
            <input 
              type="text" 
              value={form.photo_url} 
              onChange={e => setForm({ ...form, photo_url: e.target.value })}
              className="mt-5 text-sm"
              placeholder="Görsel URL'si"
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Başlık (Opsiyonel)</label>
        <input 
          type="text" 
          value={form.title || ''} 
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Görsel başlığı"
        />
      </div>

      <div className="form-group">
        <label>Açıklama (Opsiyonel)</label>
        <textarea 
          rows="2"
          value={form.description || ''} 
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Görsel açıklaması"
        />
      </div>

      <div className="form-group">
        <label>Sıralama Değeri</label>
        <input 
          type="number" 
          value={form.sort_order} 
          onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
      </div>

      <button type="submit" className="btn-primary mt-10">Kaydet</button>
    </form>
  );
}

function ReviewForm({ data, onSave }) {
  const [form, setForm] = useState({ ...data });

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={onSubmit} className="flex-column gap-15">
      <div className="form-group">
        <label>Yorum Yapan Kişi</label>
        <input 
          type="text" 
          value={form.author} 
          onChange={e => setForm({ ...form, author: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Puan (1 - 5 Yıldız)</label>
        <input 
          type="number" 
          min="1"
          max="5"
          value={form.rating} 
          onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="form-group">
        <label>Yorum Metni</label>
        <textarea 
          rows="4"
          value={form.text} 
          onChange={e => setForm({ ...form, text: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Sıralama Değeri</label>
        <input 
          type="number" 
          value={form.sort_order} 
          onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
      </div>

      <button type="submit" className="btn-primary mt-10">Kaydet</button>
    </form>
  );
}

export default App;
