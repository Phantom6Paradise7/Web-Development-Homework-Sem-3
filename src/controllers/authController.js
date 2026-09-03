const User = require('../models/User');
const Product = require('../models/Product');

// Render Login Page
exports.getLogin = (req, res) => {
  res.render('pages/auth/login', {
    title: 'Sign In - Shopease'
  });
};

// Handle Login POST
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('pages/auth/login', {
        title: 'Sign In - Shopease',
        errorMsg: 'Please enter both email and password',
        email
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.render('pages/auth/login', {
        title: 'Sign In - Shopease',
        errorMsg: 'Invalid email or password',
        email
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render('pages/auth/login', {
        title: 'Sign In - Shopease',
        errorMsg: 'Invalid email or password',
        email
      });
    }

    // Set session user
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      supplierInfo: user.supplierInfo || {}
    };

    let defaultRedirect = '/';
    if (user.role === 'admin') {
      defaultRedirect = '/admin';
    } else if (user.role === 'supplier') {
      defaultRedirect = '/supplier';
    }

    const returnUrl = req.session.returnTo || defaultRedirect;
    delete req.session.returnTo;
    res.redirect(returnUrl);
  } catch (error) {
    next(error);
  }
};

// Render Register Page
exports.getRegister = (req, res) => {
  const selectedRole = req.query.role || 'customer';
  res.render('pages/auth/register', {
    title: 'Create Account - Shopease',
    selectedRole
  });
};

// Handle Register POST
exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role = 'customer', companyName, phone } = req.body;

    const validatedRole = ['customer', 'supplier'].includes(role) ? role : 'customer';

    if (!name || !email || !password) {
      return res.render('pages/auth/register', {
        title: 'Create Account - Shopease',
        errorMsg: 'Please fill in all required fields',
        name,
        email,
        selectedRole: validatedRole,
        companyName,
        phone
      });
    }

    if (password !== confirmPassword) {
      return res.render('pages/auth/register', {
        title: 'Create Account - Shopease',
        errorMsg: 'Passwords do not match',
        name,
        email,
        selectedRole: validatedRole,
        companyName,
        phone
      });
    }

    if (password.length < 6) {
      return res.render('pages/auth/register', {
        title: 'Create Account - Shopease',
        errorMsg: 'Password must be at least 6 characters long',
        name,
        email,
        selectedRole: validatedRole,
        companyName,
        phone
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.render('pages/auth/register', {
        title: 'Create Account - Shopease',
        errorMsg: 'An account with this email already exists',
        name,
        email,
        selectedRole: validatedRole,
        companyName,
        phone
      });
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: validatedRole,
      phone: phone || ''
    };

    if (validatedRole === 'supplier') {
      userData.supplierInfo = {
        companyName: companyName || name.trim() + ' Supplies',
        storeName: companyName || name.trim() + ' Store',
        phone: phone || '',
        isVerified: true
      };
    }

    const user = new User(userData);
    await user.save();

    // Auto login
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      supplierInfo: user.supplierInfo || {}
    };

    if (user.role === 'supplier') {
      res.redirect('/supplier?success=Welcome to your Supplier Portal, ' + encodeURIComponent(user.name) + '!');
    } else {
      res.redirect('/?success=Welcome to Shopease, ' + encodeURIComponent(user.name) + '!');
    }
  } catch (error) {
    next(error);
  }
};

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/?info=You have been logged out');
  });
};

// User Profile Page
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id).lean();
    res.render('pages/profile', {
      title: 'My Profile - Shopease',
      profileUser: user
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.session.user._id);

    if (user) {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      await user.save();

      req.session.user.name = user.name;
      res.redirect('/profile?success=Profile updated successfully');
    } else {
      res.redirect('/profile?error=User not found');
    }
  } catch (error) {
    next(error);
  }
};

// Wishlist Page
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id).populate('wishlist').lean();
    res.render('pages/wishlist', {
      title: 'My Wishlist - Shopease',
      wishlistItems: user.wishlist || []
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Wishlist item (supports AJAX)
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const index = user.wishlist.findIndex(id => id.toString() === productId);
    let added = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        added,
        wishlistCount: user.wishlist.length,
        message: added ? 'Added to wishlist' : 'Removed from wishlist'
      });
    }

    res.redirect('back');
  } catch (error) {
    next(error);
  }
};
