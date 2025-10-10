import React, { useState } from 'react';
import { Icon } from '@es-rottay/designsystem-core';
import type { LucideIcon } from 'lucide-react';
// Import icons from lucide-react directly
import {
  Home, Menu, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, MoreHorizontal, MoreVertical,
  Search, Settings, Edit, Trash, Save, Download, Upload, Copy, Check,
  Plus, Minus, RefreshCw, LogOut, LogIn,
  User, Users, Mail, Bell, Calendar, Clock, Eye, EyeOff, Star, Heart,
  Share2, Lock, Unlock, Key,
  File, FileText, Folder, FolderOpen, Image, Paperclip,
  AlertCircle, AlertTriangle, Info, CheckCircle, XCircle, HelpCircle,
  Loader, Loader2,
  Play, Pause, Volume2, VolumeX, Camera, Video, Music,
  MessageCircle, MessageSquare, Send, Phone, PhoneCall,
  TrendingUp, TrendingDown, BarChart, PieChart, Activity,
  Layout, Sidebar, PanelLeft, PanelRight, Maximize, Minimize,
  Sun, Moon, Zap, Globe, MapPin, Tag, Filter, ShoppingCart, CreditCard,
  Wifi, WifiOff,
} from 'lucide-react';

interface IconItem {
  icon: LucideIcon;
  name: string;
  category: string;
}

const allIcons: IconItem[] = [
  // Navigation
  { icon: Home, name: 'Home', category: 'Navigation' },
  { icon: Menu, name: 'Menu', category: 'Navigation' },
  { icon: X, name: 'X', category: 'Navigation' },
  { icon: ChevronLeft, name: 'ChevronLeft', category: 'Navigation' },
  { icon: ChevronRight, name: 'ChevronRight', category: 'Navigation' },
  { icon: ChevronUp, name: 'ChevronUp', category: 'Navigation' },
  { icon: ChevronDown, name: 'ChevronDown', category: 'Navigation' },
  { icon: ArrowLeft, name: 'ArrowLeft', category: 'Navigation' },
  { icon: ArrowRight, name: 'ArrowRight', category: 'Navigation' },
  { icon: ArrowUp, name: 'ArrowUp', category: 'Navigation' },
  { icon: ArrowDown, name: 'ArrowDown', category: 'Navigation' },
  { icon: MoreHorizontal, name: 'MoreHorizontal', category: 'Navigation' },
  { icon: MoreVertical, name: 'MoreVertical', category: 'Navigation' },

  // Actions
  { icon: Search, name: 'Search', category: 'Actions' },
  { icon: Settings, name: 'Settings', category: 'Actions' },
  { icon: Edit, name: 'Edit', category: 'Actions' },
  { icon: Trash, name: 'Trash', category: 'Actions' },
  { icon: Save, name: 'Save', category: 'Actions' },
  { icon: Download, name: 'Download', category: 'Actions' },
  { icon: Upload, name: 'Upload', category: 'Actions' },
  { icon: Copy, name: 'Copy', category: 'Actions' },
  { icon: Check, name: 'Check', category: 'Actions' },
  { icon: Plus, name: 'Plus', category: 'Actions' },
  { icon: Minus, name: 'Minus', category: 'Actions' },
  { icon: RefreshCw, name: 'RefreshCw', category: 'Actions' },
  { icon: LogOut, name: 'LogOut', category: 'Actions' },
  { icon: LogIn, name: 'LogIn', category: 'Actions' },

  // UI Elements
  { icon: User, name: 'User', category: 'UI' },
  { icon: Users, name: 'Users', category: 'UI' },
  { icon: Mail, name: 'Mail', category: 'UI' },
  { icon: Bell, name: 'Bell', category: 'UI' },
  { icon: Calendar, name: 'Calendar', category: 'UI' },
  { icon: Clock, name: 'Clock', category: 'UI' },
  { icon: Eye, name: 'Eye', category: 'UI' },
  { icon: EyeOff, name: 'EyeOff', category: 'UI' },
  { icon: Star, name: 'Star', category: 'UI' },
  { icon: Heart, name: 'Heart', category: 'UI' },
  { icon: Share2, name: 'Share2', category: 'UI' },
  { icon: Lock, name: 'Lock', category: 'UI' },
  { icon: Unlock, name: 'Unlock', category: 'UI' },
  { icon: Key, name: 'Key', category: 'UI' },

  // Files
  { icon: File, name: 'File', category: 'Files' },
  { icon: FileText, name: 'FileText', category: 'Files' },
  { icon: Folder, name: 'Folder', category: 'Files' },
  { icon: FolderOpen, name: 'FolderOpen', category: 'Files' },
  { icon: Image, name: 'Image', category: 'Files' },
  { icon: Paperclip, name: 'Paperclip', category: 'Files' },

  // Status
  { icon: AlertCircle, name: 'AlertCircle', category: 'Status' },
  { icon: AlertTriangle, name: 'AlertTriangle', category: 'Status' },
  { icon: Info, name: 'Info', category: 'Status' },
  { icon: CheckCircle, name: 'CheckCircle', category: 'Status' },
  { icon: XCircle, name: 'XCircle', category: 'Status' },
  { icon: HelpCircle, name: 'HelpCircle', category: 'Status' },
  { icon: Loader, name: 'Loader', category: 'Status' },
  { icon: Loader2, name: 'Loader2', category: 'Status' },

  // Media
  { icon: Play, name: 'Play', category: 'Media' },
  { icon: Pause, name: 'Pause', category: 'Media' },
  { icon: Volume2, name: 'Volume2', category: 'Media' },
  { icon: VolumeX, name: 'VolumeX', category: 'Media' },
  { icon: Camera, name: 'Camera', category: 'Media' },
  { icon: Video, name: 'Video', category: 'Media' },
  { icon: Music, name: 'Music', category: 'Media' },

  // Communication
  { icon: MessageCircle, name: 'MessageCircle', category: 'Communication' },
  { icon: MessageSquare, name: 'MessageSquare', category: 'Communication' },
  { icon: Send, name: 'Send', category: 'Communication' },
  { icon: Phone, name: 'Phone', category: 'Communication' },
  { icon: PhoneCall, name: 'PhoneCall', category: 'Communication' },

  // Data
  { icon: TrendingUp, name: 'TrendingUp', category: 'Data' },
  { icon: TrendingDown, name: 'TrendingDown', category: 'Data' },
  { icon: BarChart, name: 'BarChart', category: 'Data' },
  { icon: PieChart, name: 'PieChart', category: 'Data' },
  { icon: Activity, name: 'Activity', category: 'Data' },

  // Layout
  { icon: Layout, name: 'Layout', category: 'Layout' },
  { icon: Sidebar, name: 'Sidebar', category: 'Layout' },
  { icon: PanelLeft, name: 'PanelLeft', category: 'Layout' },
  { icon: PanelRight, name: 'PanelRight', category: 'Layout' },
  { icon: Maximize, name: 'Maximize', category: 'Layout' },
  { icon: Minimize, name: 'Minimize', category: 'Layout' },

  // Other
  { icon: Sun, name: 'Sun', category: 'Other' },
  { icon: Moon, name: 'Moon', category: 'Other' },
  { icon: Zap, name: 'Zap', category: 'Other' },
  { icon: Globe, name: 'Globe', category: 'Other' },
  { icon: MapPin, name: 'MapPin', category: 'Other' },
  { icon: Tag, name: 'Tag', category: 'Other' },
  { icon: Filter, name: 'Filter', category: 'Other' },
  { icon: ShoppingCart, name: 'ShoppingCart', category: 'Other' },
  { icon: CreditCard, name: 'CreditCard', category: 'Other' },
  { icon: Wifi, name: 'Wifi', category: 'Other' },
  { icon: WifiOff, name: 'WifiOff', category: 'Other' },
];

export default function IconsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(allIcons.map(i => i.category)))];

  const filteredIcons = allIcons.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Icons System</h1>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          {allIcons.length} icons available from Lucide. Search or filter by category.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Size Presets</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Star} size="xs" />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>xs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Star} size="sm" />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>sm</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Star} size="md" />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>md</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Star} size="lg" />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>lg</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Star} size="xl" />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>xl</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Star} size="2xl" />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>2xl</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Icon icon={Loader2} size="lg" spin />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>spin</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '16px',
      }}>
        {filteredIcons.map(({ icon, name }) => (
          <div
            key={name}
            style={{
              padding: '16px',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff';
              e.currentTarget.style.background = '#f0f5ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.background = 'transparent';
            }}
            onClick={() => {
              navigator.clipboard.writeText(name);
              alert(`Copied: ${name}`);
            }}
          >
            <Icon icon={icon} size="xl" />
            <div style={{
              fontSize: '12px',
              marginTop: '8px',
              wordBreak: 'break-word',
            }}>
              {name}
            </div>
          </div>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
          No icons found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
