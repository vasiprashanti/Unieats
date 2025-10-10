import React, { useMemo } from "react";
import BannerManager from "../components/content/BannerManager";
import {
  listBanners,
  uploadBanner,
  reorderBanners,
  deleteBanner,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../api/admin";

export default function Content() {
  // Build API object once
  const bannerApi = useMemo(() => ({ listBanners, uploadBanner, reorderBanners, deleteBanner }), []);
  const faqApi = useMemo(() => ({ listFaqs, createFaq, updateFaq, deleteFaq }), []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Content Management</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Manage promotional banners, FAQs and policies.
        </p>
      </div>

      <BannerManager api={bannerApi} />
    </div>
  );
}