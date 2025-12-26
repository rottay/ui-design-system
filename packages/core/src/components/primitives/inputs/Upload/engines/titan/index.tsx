'use client';

/**
 * Upload - Titan Engine (Ant Design)
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
