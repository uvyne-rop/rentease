import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { getApiUrl } from '../utils/api'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('properties')
  const [dataLoading, setDataLoading] = useState(true)
  const [editingProperty, setEditingProperty] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', price_period: 'month', type: '',
    category: 'for-rent', bedrooms: 0, bathrooms: 0, area_sqft: '',
    county: '', location: '', address: '', featured: 0,
    amenities: '', features: '', images: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      showToast('Admin access required', 'error')
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate, showToast])

  useEffect(() => {
    if (user && user.is_admin) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setDataLoading(true)
    try {
      const [propsRes, usersRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/properties'), { credentials: 'include' }),
        fetch(getApiUrl('/api/admin/users'), { credentials: 'include' })
      ])
      
      if (propsRes.status === 403 || usersRes.status === 403) {
        showToast('Admin session expired. Please log in again.', 'error')
        navigate('/', { replace: true })
        return
      }
      
      const propsData = await propsRes.json()
      const usersData = await usersRes.json()
      
      if (propsData.properties) setProperties(propsData.properties)
      if (usersData.users) setUsers(usersData.users)
    } catch (err) {
      console.error('Failed to load admin data:', err)
      showToast('Failed to load admin data', 'error')
    } finally {
      setDataLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch(getApiUrl('/api/admin/upload'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      const data = await res.json()
      
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          images: prev.images ? `${prev.images},${data.url}` : data.url
        }))
        showToast('Image uploaded successfully!', 'success')
      } else {
        showToast(data.error || 'Upload failed', 'error')
      }
    } catch (err) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const openCreateModal = () => {
    setEditingProperty(null)
    setFormData({
      title: '', description: '', price: '', price_period: 'month', type: '',
      category: 'for-rent', bedrooms: 0, bathrooms: 0, area_sqft: '',
      county: '', location: '', address: '', featured: 0,
      amenities: '', features: '', images: ''
    })
    setShowModal(true)
  }

  const openEditModal = (property) => {
    setEditingProperty(property)
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price || '',
      price_period: property.price_period || 'month',
      type: property.type || '',
      category: property.category || 'for-rent',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area_sqft: property.area_sqft || '',
      county: property.county || '',
      location: property.location || '',
      address: property.address || '',
      featured: property.featured || 0,
      amenities: (property.amenities || []).join(','),
      features: (property.features || []).join(','),
      images: (property.images || []).join(',')
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingProperty 
        ? getApiUrl(`/api/admin/properties/${editingProperty.id}`)
        : getApiUrl('/api/admin/properties')
      const method = editingProperty ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (res.ok) {
        showToast(data.message, 'success')
        setShowModal(false)
        fetchData()
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Failed to save property', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    
    try {
      const res = await fetch(getApiUrl(`/api/admin/properties/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      
      if (res.ok) {
        showToast(data.message, 'success')
        fetchData()
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Failed to delete property', 'error')
    }
  }

  const toggleUserAdmin = async (uid, currentStatus) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${uid}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_admin: !currentStatus })
      })
      const data = await res.json()
      
      if (res.ok) {
        showToast(data.message, 'success')
        fetchData()
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Failed to update user', 'error')
    }
  }

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only administrators can access the admin dashboard.</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">Return to home</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome, <span className="font-semibold">{user?.username}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              title="Refresh data"
            >
              ↻ Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Property
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'properties' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {property.images && property.images.length > 0 && (
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="h-12 w-12 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{property.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{property.description?.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{property.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        KES {property.price?.toLocaleString()}/{property.price_period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{property.location}, {property.county}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${property.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {property.featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openEditModal(property)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${u.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleUserAdmin(u.id, u.is_admin)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Apartments">Apartments</option>
                      <option value="Bedsitters">Bedsitters</option>
                      <option value="Rentals">Rentals</option>
                      <option value="Show Room House">Show Room House</option>
                      <option value="Airbnb">Airbnb</option>
                      <option value="Villa">Villa</option>
                      <option value="Bungalow">Bungalow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Period</label>
                    <select
                      name="price_period"
                      value={formData.price_period}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="month">Month</option>
                      <option value="day">Day</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                    <input
                      type="number"
                      name="area_sqft"
                      value={formData.area_sqft}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                    <select
                      name="county"
                      value={formData.county}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select County</option>
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Machakos">Machakos</option>
                      <option value="Kajiado">Kajiado</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Uasin Gishu">Uasin Gishu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="for-rent">For Rent</option>
                      <option value="for-sale">For Sale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                    <select
                      name="featured"
                      value={formData.featured}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    placeholder="Wi-Fi, Security, Parking"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="24/7 Water, Security"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-gray-600">
                        {uploading ? (
                          <span className="text-blue-600">Uploading...</span>
                        ) : (
                          <>
                            <span className="text-blue-600 hover:text-blue-800">Click to upload</span>
                            <span className="text-gray-500"> or drag and drop</span>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WEBP up to 10MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {formData.images && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Uploaded Images:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.images.split(',').filter(Boolean).map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`Upload ${idx + 1}`} className="h-16 w-16 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images.split(',').filter((_, i) => i !== idx).join(',')
                                setFormData(prev => ({ ...prev, images: newImages }))
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        name="images"
                        value={formData.images}
                        onChange={handleInputChange}
                        placeholder="Or enter image URLs (comma-separated)"
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingProperty ? 'Update Property' : 'Create Property'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}