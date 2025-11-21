// Read the API base URL from environment at build time if available.
// Use a safe runtime check so this file doesn't throw in the browser when `process` is undefined.
const API_BASE =
	(globalThis as any).process &&
	(globalThis as any).process.env &&
	(globalThis as any).process.env.REACT_APP_API_URL
		? (globalThis as any).process.env.REACT_APP_API_URL
		: 'http://localhost:8000'

type Category = {
	id: number
	name: string
	slug?: string
	description?: string
}

type Product = {
	id: number
	name: string
	description?: string
	price: number
	unit: string
	stock: number
	image_url?: string
	rating?: number
	category?: string
	category_id?: number
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		...opts,
	})

	const text = await res.text()
	const data = text ? JSON.parse(text) : null

	if (!res.ok) {
		const err = (data && data.error) || (data && data.message) || res.statusText
		throw new Error(err)
	}

	return data as T
}

function qs(params: Record<string, string | number | undefined | null>) {
	const s = Object.entries(params)
		.filter(([, v]) => v !== undefined && v !== null && v !== '')
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
		.join('&')
	return s ? `?${s}` : ''
}

// Categories
export async function getCategories(): Promise<Category[]> {
	return request<Category[]>('/api/categories')
}

export async function createCategory(payload: {
	name: string
	slug: string
	description?: string
}) {
	return request<{ id: number; message?: string }>('/api/categories', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

// Products
export async function getProducts(opts?: {
	category?: string
	search?: string
}): Promise<Product[]> {
	const q = qs({ category: opts?.category, search: opts?.search })
	return request<Product[]>(`/api/products${q}`)
}

export async function getProduct(id: number): Promise<Product> {
	return request<Product>(`/api/products/${id}`)
}

export async function createProduct(payload: Partial<Product>) {
	return request<{ id: number; message?: string }>('/api/products', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export async function updateProduct(id: number, payload: Partial<Product>) {
	return request<{ message?: string }>(`/api/products/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	})
}

export async function deleteProduct(id: number) {
	return request<{ message?: string }>(`/api/products/${id}`, {
		method: 'DELETE',
	})
}

// Orders
export async function createOrder(payload: {
	user_id: number
	total_amount: number
	items: Array<{ product_id: number; quantity: number; price: number }>
}) {
	return request<{ order_id: number; message?: string }>('/api/orders', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export async function getOrder(id: number) {
	return request<any>(`/api/orders/${id}`)
}

export async function getUserOrders(userId: number) {
	return request<any[]>(`/api/users/${userId}/orders`)
}

// Users
export async function registerUser(payload: {
	email: string
	password: string
	first_name: string
	last_name: string
}) {
	return request<{ id: number; message?: string }>(`/api/users/register`, {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export async function loginUser(payload: { email: string; password: string }) {
	return request<{ id: number; email: string; first_name: string; last_name: string }>(
		`/api/users/login`,
		{
			method: 'POST',
			body: JSON.stringify(payload),
		},
	)
}

export async function healthCheck() {
	return request<{ status: string }>(`/api/health`)
}

export type { Product, Category }

export default {
	getCategories,
	createCategory,
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	createOrder,
	getOrder,
	getUserOrders,
	registerUser,
	loginUser,
	healthCheck,
}
