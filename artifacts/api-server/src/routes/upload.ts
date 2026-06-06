import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/upload/ensure-bucket", async (_req, res): Promise<void> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === "avatars");
    if (!exists) {
      const { error } = await supabase.storage.createBucket("avatars", {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
        fileSizeLimit: 2 * 1024 * 1024,
      });
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
    }
    res.json({ ok: true, bucket: "avatars" });
  } catch (err) {
    res.status(500).json({ error: "Failed to ensure avatars bucket" });
  }
});

export default router;