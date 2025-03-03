
import { useState } from 'react'
import { Book, MessageSquare, Map } from 'lucide-react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider 
} from '@/components/ui/sidebar'
import ChatTab from './components/chat-tab'
import AdventureTab from './components/adventure-tab'
import StoryTab from './components/story-tab'

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'adventure' | 'story'>('chat')

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <h1 className="text-xl font-bold">Fantasy AI</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'chat'} 
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'adventure'} 
                  onClick={() => setActiveTab('adventure')}
                >
                  <Map className="h-5 w-5" />
                  <span>Adventure</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'story'} 
                  onClick={() => setActiveTab('story')}
                >
                  <Book className="h-5 w-5" />
                  <span>Story</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'adventure' && <AdventureTab />}
          {activeTab === 'story' && <StoryTab />}
        </main>
      </div>
    </SidebarProvider>
  )
}
