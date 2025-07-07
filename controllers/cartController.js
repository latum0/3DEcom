// controllers/cartController.js
import crypto from 'crypto'
import Cart from '../models/Cart.js'    // adjust path if needed

// Helper to pick the right filter
const ownerFilter = (userId, guestId) =>
  userId ? { user: userId } : { guestId }

export const addToCart = async (req, res) => {
  const { productId, quantity = 1, size, color, customName } = req.body
  const userId = req.user?._id
  let guestId = req.cookies.guestId

  // 1) Ensure every visitor has a guestId
  if (!userId && !guestId) {
    guestId = crypto.randomUUID()
    res.cookie('guestId', guestId, {
      httpOnly: true,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: 'none',   // allow cross‑site
      secure: true,
    })
  }

  try {
    // 2) On login, merge guest cart into user cart
    if (userId && guestId) {
      const guestCart = await Cart.findOne({ guestId })
      if (guestCart) {
        guestCart.user = userId
        guestCart.guestId = undefined
        await guestCart.save()
      }
      res.clearCookie('guestId', {
        path: '/',
        sameSite: 'none',   // allow cross‑site
        secure: true,
      })
      guestId = undefined
    }

    // 3) Lookup or create the cart for this owner
    const filter = ownerFilter(userId, guestId)
    let cart = await Cart.findOne(filter)

    // set defaults
    const selSize = size || 's'
    const selColor = color || 'black'

    if (!cart) {
      // brand new cart
      cart = await Cart.create({
        ...(userId ? { user: userId } : { guestId }),
        items: [{
          product: productId,
          quantity,
          size: selSize,
          color: selColor,
          customName,
        }],
      })
    } else {
      // 4) Try to find an existing item with the same variant
      const existing = cart.items.find(item => {
        const pid = item.product._id
          ? item.product._id.toString()
          : item.product.toString()
        return (
          pid === productId &&
          item.size === selSize &&
          item.color === selColor &&
          (item.customName || '') === (customName || '')
        )
      })

      if (existing) {
        // update quantity
        existing.quantity = quantity
      } else {
        // add new variant
        cart.items.push({
          product: productId,
          quantity,
          size: selSize,
          color: selColor,
          customName,
        })
      }

      await cart.save()
    }

    // 5) Populate and return, including category.customNameAllowed
    await cart.populate({
      path: 'items.product',
      select: 'name price image category',
      populate: {
        path: 'category',
        select: 'customNameAllowed'
      }
    })

    res.json(cart)
  } catch (err) {
    console.error('Error in addToCart:', err)
    res.status(500).json({ error: err.message })
  }

  console.log("addToCart – req.user:", req.user, "guestId:", req.cookies.guestId);
  console.log("body:", req.body);
}

export const getCart = async (req, res) => {
  const userId = req.user?._id;
  let guestId = req.cookies.guestId;

  try {
    // 1) Merge any existing guest‐cart into the just‐logged‐in user
    if (userId && guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart) {
        guestCart.user = userId;
        guestCart.guestId = undefined;
        await guestCart.save();
      }
      // clear the cookie *and* drop the local var
      res.clearCookie('guestId', { path: '/' });
      guestId = undefined;
    }

    // 2) Build the correct filter *after* merge
    const filter = ownerFilter(userId, guestId);

    // 3) Fetch (or implicitly create) the cart
    let cart = await Cart.findOne(filter);

    // If no cart exists at all, give back an empty shape
    if (!cart) {
      return res.json({ items: [] });
    }

    // 4) Populate products → categories
    await cart.populate({
      path: 'items.product',
      select: 'name price image category',
      populate: {
        path: 'category',
        select: 'customNameAllowed'
      }
    });

    // 5) Send it down
    return res.json(cart);

  } catch (err) {
    console.error('Error in getCart:', err);
    return res.status(500).json({ error: err.message });
  }
};


export const removeFromCart = async (req, res) => {
  const userId = req.user?._id
  const guestId = req.cookies.guestId
  const { productId, size, color, customName } = req.body

  try {
    const filter = ownerFilter(userId, guestId)
    const cart = await Cart.findOne(filter)
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    cart.items = cart.items.filter(item => {
      const pid = item.product._id
        ? item.product._id.toString()
        : item.product.toString()
      // remove only the matching variant
      return !(
        pid === productId &&
        item.size === (size || 's') &&
        item.color === (color || 'black') &&
        (item.customName || '') === (customName || '')
      )
    })
    await cart.save()

    await cart.populate({
      path: 'items.product',
      select: 'name price image category',
      populate: {
        path: 'category',
        select: 'customNameAllowed'
      }
    })

    res.json(cart)
  } catch (err) {
    console.error('Error in removeFromCart:', err)
    res.status(500).json({ error: err.message })
  }
}

export const clearCart = async (req, res) => {
  const userId = req.user?._id
  const guestId = req.cookies.guestId

  try {
    const filter = ownerFilter(userId, guestId)
    const cart = await Cart.findOne(filter)
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    cart.items = []
    await cart.save()
    res.json({ items: [] })
  } catch (err) {
    console.error('Error in clearCart:', err)
    res.status(500).json({ error: err.message })
  }
}
