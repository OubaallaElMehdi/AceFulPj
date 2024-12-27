"use client";

import AdminHeader from "@/components/layout/adminHeader/AdminHeader";
import React from "react";
import Cookies from "js-cookie";

export default function Layout({ children }) {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  );
}
