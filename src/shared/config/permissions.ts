export type PermissionItem = {
  label: string
  code: string
}

export type FeatureItem = {
  id: string
  label: string
  permissions: PermissionItem[]
}

export type FeatureSection = {
  section: string
  items: FeatureItem[]
}

const permissionConfig: FeatureSection[] = [
  {
    section: "Administration",
    items: [
      {
        id: "user-management",
        label: "User Management",
        permissions: [
          { label: "View", code: "USER_VIEW" },
          { label: "Modify Platform Access", code: "USER_MODIFY_PLATFORM_PERMISSION_ACCESS" },
          { label: "Modify Record Access", code: "USER_MODIFY_RECORD_TYPE_ACCESS" },
          { label: "Save", code: "USER_SAVE" },
        ],
      },
    ],
  },
  {
    section: "Records Setup",
    items: [
      {
        id: "record-type",
        label: "Document Types",
        permissions: [
          { label: "View", code: "RECORD_TYPE_CONFIG_VIEW" },
          { label: "Save", code: "RECORD_TYPE_CONFIG_SAVE" },
        ],
      },
    ],
  },
  {
    section: "Records",
    items: [
      {
        id: "record-upload",
        label: "Upload",
        permissions: [
          { label: "View", code: "RECORD_UPLOAD_VIEW" },
          { label: "Save", code: "RECORD_UPLOAD_SAVE" },
        ],
      },
    ],
  },
]

export default permissionConfig
