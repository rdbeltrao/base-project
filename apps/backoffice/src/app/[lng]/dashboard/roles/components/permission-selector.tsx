'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Switch } from '@test-pod/ui'

interface Permission {
  id: number
  resource: string
  action: string
  name: string
  description?: string
}

interface ResourceGroup {
  resource: string
  permissions: Permission[]
}

interface PermissionSelectorProps {
  allPermissions: Permission[]
  selectedPermissionIds: number[]
  onChange: (permissionIds: number[]) => void
}

export default function PermissionSelector({
  allPermissions,
  selectedPermissionIds,
  onChange,
}: PermissionSelectorProps) {
  const [expandedResources, setExpandedResources] = useState<string[]>([])
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([])

  useEffect(() => {
    const groupedByResource: { [key: string]: Permission[] } = {}

    allPermissions.forEach(permission => {
      if (!groupedByResource[permission.resource]) {
        groupedByResource[permission.resource] = []
      }
      groupedByResource[permission.resource].push(permission)
    })

    const groups = Object.keys(groupedByResource).map(resource => ({
      resource,
      permissions: groupedByResource[resource].sort((a, b) => a.action.localeCompare(b.action)),
    }))

    setResourceGroups(groups.sort((a, b) => a.resource.localeCompare(b.resource)))

    if (selectedPermissionIds.length > 0 && groups.length > 0) {
      const firstSelectedPermission = allPermissions.find(p => selectedPermissionIds.includes(p.id))
      if (firstSelectedPermission) {
        setExpandedResources([firstSelectedPermission.resource])
      } else {
        setExpandedResources([groups[0].resource])
      }
    }
  }, [allPermissions, selectedPermissionIds])

  const toggleResource = (resource: string) => {
    setExpandedResources(prev =>
      prev.includes(resource) ? prev.filter(r => r !== resource) : [...prev, resource]
    )
  }

  const togglePermission = (permissionId: number) => {
    const newSelectedIds = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter(id => id !== permissionId)
      : [...selectedPermissionIds, permissionId]

    onChange(newSelectedIds)
  }

  const toggleAllResourcePermissions = (resource: string, isSelected: boolean) => {
    const resourcePermissionIds =
      resourceGroups.find(group => group.resource === resource)?.permissions.map(p => p.id) || []

    let newSelectedIds: number[]

    if (isSelected) {
      newSelectedIds = selectedPermissionIds.filter(id => !resourcePermissionIds.includes(id))
    } else {
      const idsToAdd = resourcePermissionIds.filter(id => !selectedPermissionIds.includes(id))
      newSelectedIds = [...selectedPermissionIds, ...idsToAdd]
    }

    onChange(newSelectedIds)
  }

  const isResourceFullySelected = (resource: string): boolean => {
    const resourcePermissions =
      resourceGroups.find(group => group.resource === resource)?.permissions || []
    return resourcePermissions.every(permission => selectedPermissionIds.includes(permission.id))
  }

  const isResourcePartiallySelected = (resource: string): boolean => {
    const resourcePermissions =
      resourceGroups.find(group => group.resource === resource)?.permissions || []
    return (
      resourcePermissions.some(permission => selectedPermissionIds.includes(permission.id)) &&
      !resourcePermissions.every(permission => selectedPermissionIds.includes(permission.id))
    )
  }

  return (
    <div className='space-y-2'>
      {resourceGroups.map(group => (
        <div key={group.resource} className='border rounded-md overflow-hidden'>
          <div
            className='flex items-center justify-between p-3 bg-gray-50 cursor-pointer'
            onClick={() => toggleResource(group.resource)}
          >
            <div className='flex items-center space-x-2'>
              {expandedResources.includes(group.resource) ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )}
              <h3 className='font-medium capitalize'>{group.resource}</h3>
            </div>
            <Switch
              checked={isResourceFullySelected(group.resource)}
              onCheckedChange={() =>
                toggleAllResourcePermissions(
                  group.resource,
                  isResourceFullySelected(group.resource)
                )
              }
              className={isResourcePartiallySelected(group.resource) ? 'bg-blue-300' : ''}
            />
          </div>

          {expandedResources.includes(group.resource) && (
            <div className='p-3 space-y-2 border-t'>
              {group.permissions.map(permission => (
                <div key={permission.id} className='flex items-center justify-between pl-6'>
                  <div>
                    <p className='text-sm font-medium'>{permission.action}</p>
                    {permission.description && (
                      <p className='text-xs text-gray-500'>{permission.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={selectedPermissionIds.includes(permission.id)}
                    onCheckedChange={() => togglePermission(permission.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
