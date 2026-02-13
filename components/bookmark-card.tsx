'use client'

import { Globe, Youtube, FileText, Link as LinkIcon, Music, Image as ImageIcon } from 'lucide-react'

interface BookmarkCardProps {
  id: string
  title: string
  url: string
  category: string
}

function getIconForUrl(url: string) {
  try {
    const hostname = new URL(url).hostname
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return <Youtube className="w-6 h-6 text-red-500" />
    }
    if (hostname.includes('github.com')) {
      return <LinkIcon className="w-6 h-6 text-gray-800" />
    }
    if (hostname.includes('spotify.com') || hostname.includes('music')) {
      return <Music className="w-6 h-6 text-green-500" />
    }
    return <Globe className="w-6 h-6 text-blue-500" />
  } catch {
    return <Globe className="w-6 h-6 text-blue-500" />
  }
}

export function BookmarkCard({ id, title, url, category }: BookmarkCardProps) {
  const truncatedUrl = url.length > 50 ? url.substring(0, 47) + '...' : url
  
  const categoryColors: Record<string, string> = {
    Work: 'bg-blue-100 text-blue-700',
    Personal: 'bg-pink-100 text-pink-700',
    Reading: 'bg-yellow-100 text-yellow-700',
    Shopping: 'bg-green-100 text-green-700',
    Social: 'bg-purple-100 text-purple-700',
    Other: 'bg-gray-100 text-gray-700',
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getIconForUrl(url)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-500 truncate mt-1">{truncatedUrl}</p>
          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[category] || categoryColors.Other}`}>
              {category.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}
