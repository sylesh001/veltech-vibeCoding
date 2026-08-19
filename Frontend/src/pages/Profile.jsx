import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser, api } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile_number || '');
      setPhotoPreview(user.profile_photo || null);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.patch('/auth/profile/', {
        name,
        mobile_number: mobile,
      });
      setUser(res.data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a local preview immediately
    setPhotoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('profile_photo', file);

    try {
      const res = await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      setMessage('Profile photo updated successfully.');
    } catch (err) {
      setError('Failed to update profile photo.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMessage('');
    setPwdError('');
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    try {
      await api.put('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwdMessage('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.old_password?.[0] || 'Failed to change password.');
    }
  };

  return (
    <div className="font-sans text-on-surface">
      <main className="w-full max-w-container-max mx-auto transition-all">
        <h1 className="text-display-sm font-display-sm mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
            <h2 className="text-headline-sm font-headline-sm mb-6">Personal Information</h2>
            
            <div className="mb-6 flex items-center gap-6">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant bg-surface-container flex-shrink-0 cursor-pointer">
                <img 
                  src={photoPreview || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=96`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-label-sm tracking-wider uppercase">Change</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePhotoChange}
                  title="Upload profile photo"
                />
              </div>
              <div>
                <h3 className="font-headline-md text-on-surface">{user?.name}</h3>
                <p className="text-body-md text-on-surface-variant">Update your photo and personal details.</p>
              </div>
            </div>

            {message && <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-body-md">{message}</div>}
            {error && <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-body-md">{error}</div>}
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Email (Read Only)</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface-variant opacity-70 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Mobile Number</label>
                <input 
                  type="text" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
            <h2 className="text-headline-sm font-headline-sm mb-6">Change Password</h2>
            {pwdMessage && <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-body-md">{pwdMessage}</div>}
            {pwdError && <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-body-md">{pwdError}</div>}
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                  minLength={8}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
