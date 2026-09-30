"use client"

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  href?: string;
}

export default function Logo({
  className = "",
  width = 140,
  height = 40,
  priority = true,
  href = "/",
}: LogoProps) {
  const logoContent = (
    <Image
      src="/logo1.png"
      alt="HAQEX Logo"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );

  if (typeof href === "string" && href.trim() !== "") {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
