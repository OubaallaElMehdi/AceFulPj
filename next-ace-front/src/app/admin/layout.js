import AdminHeader from "@/components/layout/adminHeader/AdminHeader";
import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  );
}
