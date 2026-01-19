import {
  ICustomerTrackingEventAcl,
  ICustomerTrackingEventAclValue,
  IRoleTrackingEventAcl,
  IRoleTrackingEventAclValue,
  ITemplateConfiguration,
  ITemplateConfigurationActions,
  ITemplateConfigurationActionItem,
  ITemplateConfigurationValues,
  ITimelineTracking,
  ITracker,
  ITrackingEvent,
  ITrackingEventAclCollection,
  ITrackingEventCollection,
  ITrackingEventMention,
  ITrackingEventMentionCollection,
  ITrackingEventMentionUser,
  ITrackingTimeline,
  ITrackingTimelineItem,
} from "../components/tracking-timeline/types";
import { CommonUserModel } from "./shared";

// Simple template text processing function
const processTemplateText = (
  templateText: string,
  templateConfig?: Record<string, { getValue(): string }>,
): string => {
  if (!templateText || !templateConfig) {
    return templateText;
  }

  let processedText = templateText;

  Object.entries(templateConfig).forEach(([key, config]) => {
    const placeholder = `{${key}}`;
    const value = config.getValue();

    if (processedText.includes(placeholder) && value) {
      processedText = processedText.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        value,
      );
    }
  });

  return processedText;
};

export class TrackingTimelineModel {
  object: string;
  id: number;
  timeline_items: TrackingTimelineItemModel[];

  constructor(data: ITrackingTimeline) {
    this.object = data.object;
    this.id = data.id;
    this.timeline_items = data.timeline_items.data.map(
      (item: ITrackingTimelineItem) => new TrackingTimelineItemModel(item),
    );
  }

  getId = () => this.id;
  getTimelineItems = () => this.timeline_items;
  getSortedTimelineItems = () =>
    this.timeline_items.sort(
      (a, b) => a.getDisplayOrder() - b.getDisplayOrder(),
    );
}
export class TemplateConfigurationValueItemModel {
  type: string;
  value: string;

  constructor(data: { type: string; value: string }) {
    this.type = data.type;
    this.value = data.value;
  }

  getType = () => this.type;
  getValue = () => this.value;
}

export class TemplateConfigurationValuesModel {
  object: string;
  data: Record<string, TemplateConfigurationValueItemModel>;

  constructor(data: ITemplateConfigurationValues) {
    this.object = data.object;
    this.data = Object.fromEntries(
      Object.entries(data.data).map(([key, value]) => [
        key,
        new TemplateConfigurationValueItemModel(value),
      ]),
    );
  }

  getData = () => this.data;
  getValue = (key: string) => this.data[key]?.getValue();
}

export class TemplateConfigurationActionItemModel {
  on: string;
  name: string;
  label: string | null;
  target: string;

  constructor(data: ITemplateConfigurationActionItem) {
    this.on = data.on;
    this.name = data.name;
    this.label = data.label;
    this.target = data.target;
  }

  getOn = () => this.on;
  getName = () => this.name;
  getLabel = () => this.label;
  getTarget = () => this.target;
}

export class TemplateConfigurationActionsModel {
  object: string;
  data:
    | TemplateConfigurationActionItemModel[]
    | TemplateConfigurationActionItemModel;

  constructor(data: ITemplateConfigurationActions) {
    this.object = data.object;
    if (Array.isArray(data.data)) {
      this.data = data.data.map(
        (item) => new TemplateConfigurationActionItemModel(item),
      );
    } else {
      this.data = new TemplateConfigurationActionItemModel(data.data);
    }
  }

  getData = () => this.data;
}

export class TemplateConfigurationModel {
  values: TemplateConfigurationValuesModel;
  actions: TemplateConfigurationActionsModel;

  constructor(data: ITemplateConfiguration) {
    this.values = new TemplateConfigurationValuesModel(data.values);
    this.actions = new TemplateConfigurationActionsModel(data.actions);
  }

  getValues = () => this.values;
  getActions = () => this.actions;
}

export class CustomerTrackingEventAclValue {
  object: string;
  id: number;
  name: string;
  phone: string | null;
  email: string;
  type: string;

  constructor(data: ICustomerTrackingEventAclValue) {
    this.object = data.object;
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.type = data.type;
  }

  getId = () => this.id;
  getName = () => this.name;
  getPhone = () => this.phone;
  getEmail = () => this.email;
  getType = () => this.type;
}

export class CustomerTrackingEventAclModel {
  object: string;
  id: number;
  acl_type: "user";
  acl_value: CustomerTrackingEventAclValue;

  constructor(data: ICustomerTrackingEventAcl) {
    this.object = data.object;
    this.id = data.id;
    this.acl_type = data.acl_type;
    this.acl_value = new CustomerTrackingEventAclValue(data.acl_value);
  }

  getId = () => this.id;
  getAclType = () => this.acl_type;
  getAclValue = () => this.acl_value;
}

export class RoleTrackingEventAclValue {
  object: string;
  id: number;
  name: string;
  label: string | null;

  constructor(data: IRoleTrackingEventAclValue) {
    this.object = data.object;
    this.id = data.id;
    this.name = data.name;
    this.label = data.label;
  }

  getId = () => this.id;
  getName = () => this.name;
  getLabel = () => this.label;
}

export class RoleTrackingEventAclModel {
  object: string;
  id: number;
  acl_type: "role";
  acl_value: RoleTrackingEventAclValue;

  constructor(data: IRoleTrackingEventAcl) {
    this.object = data.object;
    this.id = data.id;
    this.acl_type = data.acl_type;
    this.acl_value = new RoleTrackingEventAclValue(data.acl_value);
  }

  getId = () => this.id;
  getAclType = () => this.acl_type;
  getAclValue = () => this.acl_value;
}

export class TrackingEventAclCollectionModel {
  object: string;
  data: (RoleTrackingEventAclModel | CustomerTrackingEventAclModel)[];

  constructor(data: ITrackingEventAclCollection) {
    this.object = data.object;
    this.data = data.data.map(
      (item: IRoleTrackingEventAcl | ICustomerTrackingEventAcl) => {
        if (item.acl_type === "role") {
          return new RoleTrackingEventAclModel(item as IRoleTrackingEventAcl);
        } else if (item.acl_type === "user") {
          return new CustomerTrackingEventAclModel(
            item as ICustomerTrackingEventAcl,
          );
        } else {
          throw new Error(`Invalid acl_type`);
        }
      },
    );
  }

  getData = () => this.data;
  getUserData = () => this.data.filter((d) => d.getAclType() === "user");
  getRoleData = () => this.data.filter((d) => d.getAclType() === "role");
}

export class TrackingEventMentionUserModel {
  object: string;
  id: number;
  name: string;
  phone: string | null;
  email: string;
  type: string;

  constructor(data: ITrackingEventMentionUser) {
    this.object = data.object;
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.type = data.type;
  }

  getName = () => this.name;
  getId = () => this.id;
}

export class TrackingEventMentionModel {
  object: string;
  id: number;
  user: TrackingEventMentionUserModel;

  constructor(data: ITrackingEventMention) {
    this.object = data.object;
    this.id = data.id;
    this.user = new TrackingEventMentionUserModel(data.user);
  }

  getId = () => this.id;
  getUser = () => this.user;
}

export class TrackingTimelineItemModel {
  object: string;
  id: number;
  label: string;
  identifier: string;
  description: string | null;
  icon: string;
  display_order: number;
  created_at: string;

  constructor(data: ITrackingTimelineItem) {
    this.object = data.object;
    this.id = data.id;
    this.label = data.label;
    this.identifier = data.identifier;
    this.description = data.description;
    this.icon = data.icon;
    this.display_order = data.display_order;
    this.created_at = data.created_at;
  }

  getId = () => this.id;
  getLabel = () => this.label;
  getIdentifier = () => this.identifier;
  getDescription = () => this.description;
  getIcon = () => this.icon;
  getDisplayOrder = () => this.display_order;
  getCreatedAt = () => this.created_at;
}

export class TrackingEventMentionCollectionModel {
  object: string;
  data: TrackingEventMentionModel[];

  constructor(data: ITrackingEventMentionCollection) {
    this.object = data.object;
    this.data = data.data.map(
      (d: ITrackingEventMention) => new TrackingEventMentionModel(d),
    );
  }

  getData = () => this.data;
}

export class TrackingEventModel {
  object: string;
  id: number;
  label: string | null;
  message: string | null;
  template: string | null;
  causer: CommonUserModel | null;
  template_configuration: TemplateConfigurationModel | null;
  display_order: number;
  timeline_item?: TrackingTimelineItemModel;
  children: TrackingEventModel[];
  acls: TrackingEventAclCollectionModel;
  mentions: TrackingEventMentionCollectionModel;
  created_at: string;
  updated_at: string;

  constructor(data: ITrackingEvent) {
    this.object = data.object;
    this.id = data.id;
    this.label = data.label;
    this.message = data.message;
    this.template = data.template;
    this.template_configuration = data.template_configuration
      ? new TemplateConfigurationModel(data.template_configuration)
      : null;
    this.display_order = data.display_order;
    this.timeline_item =
      data.timeline_item && new TrackingTimelineItemModel(data.timeline_item);
    this.children = data.children.map(
      (c: ITrackingEvent) => new TrackingEventModel(c),
    );
    this.acls = new TrackingEventAclCollectionModel(data.acls);
    this.mentions = new TrackingEventMentionCollectionModel(data.mentions);
    this.causer = data.causer ? new CommonUserModel(data.causer) : null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  getId = () => this.id;

  // Auto-process template text in getters
  getLabel = () => {
    let label = this.label;

    // If no template configuration, return as is
    if (!this.template_configuration) {
      return label;
    }

    const templateConfig = this.template_configuration.getValues().getData();
    return processTemplateText(label || "", templateConfig);
  };

  getMessage = () => {
    const message = this.message;
    if (!message || !this.template_configuration) {
      return message;
    }
    const templateConfig = this.template_configuration.getValues().getData();
    return processTemplateText(message, templateConfig);
  };

  getTemplate = () => this.template;
  getTemplateConfiguration = () => this.template_configuration;
  getDisplayOrder = () => this.display_order;
  getTimelineItem = () => this.timeline_item;
  getChildren = () => this.children;
  getAcls = () => this.acls;
  getMentions = () => this.mentions;
  getCauser = () => this.causer;
  getCreatedAt = () => this.created_at;
  getUpdatedAt = () => this.updated_at;
  isEdited = () => this.created_at !== this.updated_at;

  // Get content from template configuration if message is null
  getContent = () => {
    let content = null;

    if (this.message) {
      content = this.message;
    } else if (this.template_configuration) {
      // Try to get content from template configuration
      const values = this.template_configuration.getValues();
      content = values.getValue("content");
    }

    // Auto-process template text if we have template configuration
    if (content && this.template_configuration) {
      const templateConfig = this.template_configuration.getValues().getData();
      return processTemplateText(content, templateConfig);
    }

    return content;
  };
}

export class TrackingEventCollectionModel {
  object: string;
  data: TrackingEventModel[];

  constructor(data: ITrackingEventCollection) {
    this.object = data.object;
    this.data = data.data.map((d: ITrackingEvent) => new TrackingEventModel(d));
  }

  getData = () => this.data;
  // Method to get sorted data by created_at
  getSortedData = () =>
    this.data.sort(
      (a, b) =>
        new Date(b.getCreatedAt()).getTime() -
        new Date(a.getCreatedAt()).getTime(),
    );
}

export class TrackerModel {
  object: string;
  id: number;
  track_for: string;
  timeline?: TrackingTimelineModel; // Customer timelines have this
  tracking_events: TrackingEventCollectionModel;

  constructor(data: ITracker) {
    this.object = data.object;
    this.id = data.id;
    this.track_for = data.track_for;
    this.timeline = data.timeline
      ? new TrackingTimelineModel(data.timeline)
      : undefined;
    this.tracking_events = new TrackingEventCollectionModel(
      data.tracking_events,
    );
  }

  getId = () => this.id;
  getTrackFor = () => this.track_for;
  getTimeline = () => this.timeline;
  getTrackingEvents = () => this.tracking_events;
}

export class TimelineTrackingModel {
  data?: TrackerModel; // there are products where it does not exist,
  // for example old products that we dont keep agent tracking timeline
  constructor(data: ITimelineTracking) {
    this.data = data.data && new TrackerModel(data.data);
  }
  getData = () => this.data;
  getTrackingEventsData = () => this.data?.tracking_events.data;
  getTimelineData = () => this.data?.timeline;
  getTimelineItems = () => this.data?.timeline?.getSortedTimelineItems();
}
