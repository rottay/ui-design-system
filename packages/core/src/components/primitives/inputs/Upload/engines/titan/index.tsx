'use client';

/**
 * @fileoverview Upload Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Upload component providing
 * full-featured file upload with progress tracking, previews, and list types.
 *
 * @remarks
 * The Titan engine leverages Ant Design's Upload for:
 * - **Progress tracking**: Real-time upload progress bars
 * - **List types**: text, picture, picture-card, picture-circle
 * - **Drag and drop**: Native Dragger component
 * - **Preview/Download**: Built-in file preview and download
 * - **Custom request**: Override default XHR behavior
 * - **Accessibility**: Full ARIA support and keyboard navigation
 *
 * This is the most feature-complete engine for file uploads.
 *
 * @example Basic upload
 * ```tsx
 * <Upload engine="titan" action="/api/upload">
 *   <Button icon={<UploadIcon />}>Upload</Button>
 * </Upload>
 * ```
 *
 * @example Picture card
 * ```tsx
 * <Upload engine="titan" listType="picture-card" action="/api/upload" />
 * ```
 *
 * @see {@link Upload} - Main component
 * @see {@link UploadProps} - Component props
 * @module Upload/Engines/Titan
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { Upload as AntUpload } from 'antd';
import type { UploadProps, DraggerProps, UploadChangeInfo } from '../../types';
import { UPLOAD_DEFAULTS } from '../../types';

export const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (props, ref) => {
    const {
      action,
      accept,
      multiple = UPLOAD_DEFAULTS.multiple,
      fileList,
      defaultFileList,
      directory,
      maxCount,
      customRequest,
      listType = UPLOAD_DEFAULTS.listType,
      showUploadList = UPLOAD_DEFAULTS.showUploadList,
      disabled = UPLOAD_DEFAULTS.disabled,
      headers,
      data,
      name = UPLOAD_DEFAULTS.name,
      withCredentials = UPLOAD_DEFAULTS.withCredentials,
      openFileDialogOnClick = UPLOAD_DEFAULTS.openFileDialogOnClick,
      progress,
      beforeUpload,
      onChange,
      onPreview,
      onRemove,
      onDownload,
      onDrop,
      itemRender,
      iconRender,
      children,
      className,
      style,
    } = props;

    const handleChange = (info: unknown) => {
      if (onChange) {
        onChange(info as UploadChangeInfo);
      }
    };

    return (
      <div ref={ref} className={className} style={style}>
        <AntUpload
          action={action as string}
          accept={accept}
          multiple={multiple}
          fileList={fileList as never}
          defaultFileList={defaultFileList as never}
          directory={directory}
          maxCount={maxCount}
          customRequest={customRequest as never}
          listType={listType}
          showUploadList={showUploadList}
          disabled={disabled}
          headers={headers}
          data={data as never}
          name={name}
          withCredentials={withCredentials}
          openFileDialogOnClick={openFileDialogOnClick}
          progress={progress}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          onPreview={onPreview as never}
          onRemove={onRemove as never}
          onDownload={onDownload as never}
          onDrop={onDrop}
          itemRender={itemRender as never}
          iconRender={iconRender as never}
        >
          {children}
        </AntUpload>
      </div>
    );
  }
);

Upload.displayName = 'Upload.Titan';

export const Dragger = React.forwardRef<HTMLDivElement, DraggerProps>(
  (props, ref) => {
    const {
      action,
      accept,
      multiple = UPLOAD_DEFAULTS.multiple,
      fileList,
      defaultFileList,
      directory,
      maxCount,
      customRequest,
      listType = UPLOAD_DEFAULTS.listType,
      showUploadList = UPLOAD_DEFAULTS.showUploadList,
      disabled = UPLOAD_DEFAULTS.disabled,
      headers,
      data,
      name = UPLOAD_DEFAULTS.name,
      withCredentials = UPLOAD_DEFAULTS.withCredentials,
      progress,
      beforeUpload,
      onChange,
      onPreview,
      onRemove,
      onDownload,
      onDrop,
      itemRender,
      iconRender,
      children,
      className,
      style,
      height,
    } = props;

    const handleChange = (info: unknown) => {
      if (onChange) {
        onChange(info as UploadChangeInfo);
      }
    };

    return (
      <div ref={ref} className={className} style={{ ...style, height }}>
        <AntUpload.Dragger
          action={action as string}
          accept={accept}
          multiple={multiple}
          fileList={fileList as never}
          defaultFileList={defaultFileList as never}
          directory={directory}
          maxCount={maxCount}
          customRequest={customRequest as never}
          listType={listType}
          showUploadList={showUploadList}
          disabled={disabled}
          headers={headers}
          data={data as never}
          name={name}
          withCredentials={withCredentials}
          progress={progress}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          onPreview={onPreview as never}
          onRemove={onRemove as never}
          onDownload={onDownload as never}
          onDrop={onDrop}
          itemRender={itemRender as never}
          iconRender={iconRender as never}
          height={height as number}
        >
          {children}
        </AntUpload.Dragger>
      </div>
    );
  }
);

Dragger.displayName = 'Upload.Dragger.Titan';

export default Upload;
