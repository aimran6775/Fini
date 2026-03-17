# 🌐 finitaxgt.com — DNS Setup Guide

## Step 1: Add DNS Records in Squarespace

Go to **Squarespace → Domains → finitaxgt.com → DNS Settings**

Add these **4 records**:

---

### Record 1 — Root Domain (finitaxgt.com)

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Host** | `@` |
| **Value** | `ebahq5qz.up.railway.app` |

> ⚠️ If Squarespace doesn't allow CNAME on `@`, use **ALIAS** or **ANAME** if available. Some registrars require an A record for root domains — in that case, use Railway's dashboard to find the IP.

---

### Record 2 — Railway Verification (root)

| Field | Value |
|-------|-------|
| **Type** | `TXT` |
| **Host** | `_railway-verify` |
| **Value** | `railway-verify=railway-verify=c46d077eb97025eb6af6a09fad6d102cb43e23f02a20ddf12b3da5f60cb36943` |

---

### Record 3 — www Subdomain (www.finitaxgt.com)

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Host** | `www` |
| **Value** | `m4bv4rlu.up.railway.app` |

---

### Record 4 — Railway Verification (www)

| Field | Value |
|-------|-------|
| **Type** | `TXT` |
| **Host** | `_railway-verify.www` |
| **Value** | `railway-verify=railway-verify=b800a8ed545f9b72833326d171d864862ff860b3bd16f7c653d18238c41d2b9e` |

---

## Step 2: Add Redirect URLs in Supabase

Go to: https://supabase.com/dashboard/project/njbknxmdhmoreknnoylp/auth/url-configuration

Under **Redirect URLs**, click **Add URL** and add both:

```
https://finitaxgt.com/auth/callback
https://www.finitaxgt.com/auth/callback
```

---

## Timeline

- **DNS propagation:** 5 minutes to 72 hours (usually under 30 min)
- **SSL certificate:** Railway auto-provisions once DNS verifies
- After both complete, **https://finitaxgt.com** will be live 🚀

---

## Quick Verification

Once DNS propagates, test with:

```bash
curl -s -o /dev/null -w "%{http_code}" https://finitaxgt.com
curl -s -o /dev/null -w "%{http_code}" https://www.finitaxgt.com
```

Both should return `200`.
