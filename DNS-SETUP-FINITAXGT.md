# 🌐 finitaxgt.com — DNS Setup Guide

## Step 1: Add DNS Records in Squarespace

Go to **Squarespace → Domains → finitaxgt.com → DNS Settings**

### Current Status

| # | Record | Status |
|---|--------|--------|
| 1 | Root CNAME (`@`) | ❌ **MISSING** |
| 2 | TXT verification (root) | ❌ **MISSING** |
| 3 | www CNAME | ✅ Done |
| 4 | TXT verification (www) | ❌ **MISSING** |

---

### ❌ Record 1 — Root Domain (finitaxgt.com)

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Host** | `@` |
| **Value** | `ebahq5qz.up.railway.app` |

> ⚠️ Squarespace may not allow CNAME on `@`. If so, try **ALIAS** or **ANAME** type instead. If none of those work, you may need to use a **Forwarding** rule from `@` → `www.finitaxgt.com` as a workaround.

---

### ❌ Record 2 — Railway Verification (root)

| Field | Value |
|-------|-------|
| **Type** | `TXT` |
| **Host** | `_railway-verify` |
| **Value** | `railway-verify=railway-verify=c46d077eb97025eb6af6a09fad6d102cb43e23f02a20ddf12b3da5f60cb36943` |

---

### ✅ Record 3 — www Subdomain (www.finitaxgt.com) — ALREADY DONE

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Host** | `www` |
| **Value** | `m4bv4rlu.up.railway.app` |

---

### ❌ Record 4 — Railway Verification (www)

| Field | Value |
|-------|-------|
| **Type** | `TXT` |
| **Host** | `_railway-verify.www` |
| **Value** | `railway-verify=railway-verify=b800a8ed545f9b72833326d171d864862ff860b3bd16f7c653d18238c41d2b9e` |

---

## Step 2: Add Redirect URLs in Supabase — ✅ DONE

Already configured via Supabase API:

- `https://finitaxgt.com/auth/callback`
- `https://www.finitaxgt.com/auth/callback`
- `https://fini-tax-production.up.railway.app/auth/callback`
- `http://localhost:3000/auth/callback`

---

## Timeline

- **DNS propagation:** 5 minutes to 72 hours (usually under 30 min)
- **SSL certificate:** Railway auto-provisions once DNS verifies
- After all records are added, **https://finitaxgt.com** will be live 🚀

---

## Quick Verification

Once DNS propagates, test with:

```bash
# Check DNS resolution
dig finitaxgt.com CNAME +short
dig _railway-verify.finitaxgt.com TXT +short

# Check HTTP response
curl -s -o /dev/null -w "%{http_code}" https://finitaxgt.com
curl -s -o /dev/null -w "%{http_code}" https://www.finitaxgt.com
```

Both should return `200`.

Both should return `200`.
