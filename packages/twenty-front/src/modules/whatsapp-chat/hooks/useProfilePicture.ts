import { useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

// In-memory cache shared across all hook instances to avoid re-fetching
const pictureCache = new Map<string, string | null>();

/**
 * Fetches a WhatsApp contact's profile picture via the WAHA bridge.
 *
 * @param sessionName - The WAHA session name
 * @param phoneNumber - The contact's phone number (will be converted to JID)
 * @returns { pictureUrl } - The profile picture URL or null
 */
export const useProfilePicture = (
  sessionName: string | undefined,
  phoneNumber: string | undefined,
) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionName || !phoneNumber) return;

    const cacheKey = `${sessionName}:${phoneNumber}`;

    // Already fetched this exact combo
    if (fetchedRef.current === cacheKey) return;

    // Check cache
    if (pictureCache.has(cacheKey)) {
      setPictureUrl(pictureCache.get(cacheKey) ?? null);
      fetchedRef.current = cacheKey;
      return;
    }

    let cancelled = false;

    const fetchPicture = async () => {
      setLoading(true);

      try {
        // WAHA expects JID format: phonenumber@s.whatsapp.net
        const jid = phoneNumber.includes('@')
          ? phoneNumber
          : `${phoneNumber}@s.whatsapp.net`;

        const data = await bridgeFetch<{ profilePictureUrl?: string }>(
          `/api/v1/contacts/${encodeURIComponent(jid)}/profile-picture?session=${encodeURIComponent(sessionName)}`,
        );

        if (!cancelled) {
          const url = data?.profilePictureUrl ?? null;
          pictureCache.set(cacheKey, url);
          setPictureUrl(url);
          fetchedRef.current = cacheKey;
        }
      } catch {
        // Profile picture not available — use initials fallback
        if (!cancelled) {
          pictureCache.set(cacheKey, null);
          setPictureUrl(null);
          fetchedRef.current = cacheKey;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPicture();

    return () => {
      cancelled = true;
    };
  }, [sessionName, phoneNumber, bridgeFetch]);

  return { pictureUrl, loading };
};
